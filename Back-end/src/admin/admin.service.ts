import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { orderInclude, slugify, toOrderDto, toProductDto, toPromotionDto, toUserDto } from '../common/mappers.js';
import { ORDER_STATUS_LABEL, ORDER_TRANSITIONS } from '../common/order-status.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { SETTING_SHIPPING_FEE } from '../promotions/promotions.service.js';
import { ATTRIBUTE_KEYS } from '../products/dto/product-query.dto.js';
import { restockOrder } from '../orders/orders.service.js';
import type { CategoryInputDto, ProductInputDto, PromotionInputDto } from './dto/admin.dto.js';

const MAX_CHILDREN = 4;

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ================= Dashboard =================

  /** Doanh thu CHỈ tính đơn COMPLETED (theo ngày hoàn thành); đơn hủy không được tính. */
  async dashboard() {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - 6);

    const [revenue, totalOrders, groups, customers, products, lowStock, recent, completedRecent] = await Promise.all([
      this.prisma.order.aggregate({ where: { status: 'COMPLETED' }, _sum: { total: true } }),
      this.prisma.order.count(),
      this.prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.product.findMany({ where: { isActive: true, stock: { lte: 5 } }, orderBy: { stock: 'asc' }, include: { attributes: true } }),
      this.prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: orderInclude }),
      this.prisma.order.findMany({ where: { status: 'COMPLETED', completedAt: { gte: since } }, select: { total: true, completedAt: true } }),
    ]);

    const localKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const revenueLast7Days = [...Array(7)].map((_, i) => {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = localKey(d);
      return { date: key, revenue: completedRecent.filter((o) => o.completedAt && localKey(o.completedAt) === key).reduce((s, o) => s + o.total, 0) };
    });

    const count = (s: OrderStatus) => groups.find((g) => g.status === s)?._count._all ?? 0;
    return {
      revenue: revenue._sum.total ?? 0,
      totalOrders,
      pendingOrders: count('PENDING'),
      statusCounts: (Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((status) => ({ status, count: count(status) })),
      customers,
      products,
      lowStock: lowStock.map(toProductDto),
      recentOrders: recent.map(toOrderDto),
      revenueLast7Days,
    };
  }

  // ================= Sản phẩm =================

  listProducts() {
    return this.prisma.product
      .findMany({ where: { isActive: true }, include: { attributes: true }, orderBy: { id: 'asc' } })
      .then((l) => l.map(toProductDto));
  }

  async getProduct(id: number) {
    const p = await this.prisma.product.findFirst({ where: { id, isActive: true }, include: { attributes: true } });
    if (!p) throw new NotFoundException('Không tìm thấy sản phẩm');
    return toProductDto(p);
  }

  private async validateProduct(dto: ProductInputDto, id?: number) {
    const cat = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!cat || cat.parentId === null) throw new BadRequestException('Sản phẩm phải thuộc một danh mục cấp 2');
    const dup = await this.prisma.product.findUnique({ where: { code: dto.code } });
    if (dup && dup.id !== id) throw new ConflictException('Mã sản phẩm đã tồn tại');
  }

  /** Chỉ giữ các khóa thuộc tính chuẩn và giá trị không rỗng */
  private attributeRows(attrs: Record<string, string>) {
    return Object.entries(attrs)
      .filter(([k, v]) => (ATTRIBUTE_KEYS as readonly string[]).includes(k) && typeof v === 'string' && v.trim())
      .map(([key, value]) => ({ key, value: value.trim() }));
  }

  private productData(dto: ProductInputDto) {
    return {
      code: dto.code,
      slug: slugify(dto.code + '-' + dto.name),
      name: dto.name,
      categoryId: dto.categoryId,
      brand: dto.brand,
      price: dto.price,
      stock: dto.stock,
      warrantyMonths: dto.warrantyMonths,
      images: dto.images,
      highlights: dto.highlights,
      description: dto.description,
      specs: dto.specs,
      compatibilityNote: dto.compatibilityNote || null,
    };
  }

  async createProduct(dto: ProductInputDto) {
    await this.validateProduct(dto);
    const p = await this.prisma.product.create({
      data: { ...this.productData(dto), attributes: { create: this.attributeRows(dto.attributes) } },
      include: { attributes: true },
    });
    return toProductDto(p);
  }

  async updateProduct(id: number, dto: ProductInputDto) {
    await this.getProduct(id);
    await this.validateProduct(dto, id);
    const p = await this.prisma.$transaction(async (tx) => {
      await tx.productAttribute.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: { ...this.productData(dto), attributes: { create: this.attributeRows(dto.attributes) } },
        include: { attributes: true },
      });
    });
    return toProductDto(p);
  }

  /** Xóa mềm: ẩn khỏi cửa hàng nhưng giữ nguyên lịch sử đơn hàng (order_items tham chiếu sản phẩm). */
  async deleteProduct(id: number) {
    await this.getProduct(id);
    // đổi mã để có thể tạo lại sản phẩm cùng mã sau này
    await this.prisma.product.update({ where: { id }, data: { isActive: false, code: `DEL${id}-${Date.now()}`.slice(0, 50), slug: `deleted-${id}-${Date.now()}` } });
    return { ok: true };
  }

  async updateStock(id: number, stock: number) {
    await this.getProduct(id);
    const p = await this.prisma.product.update({ where: { id }, data: { stock }, include: { attributes: true } });
    return toProductDto(p);
  }

  // ================= Danh mục =================

  async listCategories() {
    const list = await this.prisma.category.findMany({
      orderBy: { id: 'asc' },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });
    return list.map(({ _count, createdAt: _c, ...c }) => ({ ...c, productCount: _count.products }));
  }

  /** Quy tắc LAB 6: đúng 3 danh mục cấp 1 (cố định), tối đa 4 danh mục con/nhóm, tối đa 2 cấp. */
  private async validateChild(dto: CategoryInputDto, id?: number) {
    if (dto.parentId == null) throw new BadRequestException('Hệ thống cố định 3 danh mục cấp 1 (LAB 6). Chỉ được thêm danh mục con.');
    const parent = await this.prisma.category.findUnique({ where: { id: dto.parentId }, include: { children: true } });
    if (!parent || parent.parentId !== null) throw new BadRequestException('Danh mục cha phải là danh mục cấp 1');
    const siblings = parent.children.filter((c) => c.id !== id);
    if (siblings.length >= MAX_CHILDREN) throw new BadRequestException(`"${parent.name}" đã có đủ ${MAX_CHILDREN} danh mục con`);
    if (siblings.some((c) => c.name.toLowerCase() === dto.name.toLowerCase())) throw new ConflictException('Tên danh mục đã tồn tại trong nhóm');
  }

  async createCategory(dto: CategoryInputDto) {
    await this.validateChild(dto);
    let slug = slugify(dto.name);
    if (await this.prisma.category.findUnique({ where: { slug } })) slug = `${slug}-${Date.now() % 10000}`;
    return this.prisma.category.create({ data: { name: dto.name, slug, parentId: dto.parentId, description: dto.description ?? '' } });
  }

  async updateCategory(id: number, dto: CategoryInputDto) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Không tìm thấy danh mục');
    if (cat.parentId === null) {
      // cấp 1: chỉ đổi tên & mô tả, không đổi cấp
      return this.prisma.category.update({ where: { id }, data: { name: dto.name, description: dto.description ?? '' } });
    }
    await this.validateChild(dto, id);
    return this.prisma.category.update({ where: { id }, data: { name: dto.name, parentId: dto.parentId, description: dto.description ?? '' } });
  }

  async deleteCategory(id: number) {
    const cat = await this.prisma.category.findUnique({ where: { id }, include: { _count: { select: { products: true } } } });
    if (!cat) throw new NotFoundException('Không tìm thấy danh mục');
    if (cat.parentId === null) throw new BadRequestException('Không thể xóa danh mục cấp 1');
    if (cat._count.products > 0) throw new ConflictException('Danh mục đang có sản phẩm, hãy chuyển sản phẩm sang danh mục khác trước');
    await this.prisma.category.delete({ where: { id } });
    return { ok: true };
  }

  // ================= Đơn hàng =================

  async listOrders(status?: string) {
    const where: Prisma.OrderWhereInput = status && status in ORDER_STATUS_LABEL ? { status: status as OrderStatus } : {};
    const list = await this.prisma.order.findMany({ where, include: { ...orderInclude, user: true }, orderBy: { createdAt: 'desc' } });
    return list.map((o) => ({ ...toOrderDto(o), customerEmail: o.user.email }));
  }

  async getOrder(code: string) {
    const order = await this.prisma.order.findUnique({ where: { code }, include: { ...orderInclude, user: true } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    const products = await this.prisma.product.findMany({ where: { id: { in: order.items.map((i) => i.productId) } }, select: { id: true, stock: true } });
    return {
      order: toOrderDto(order),
      customer: { id: order.user.id, fullName: order.user.fullName, email: order.user.email, phone: order.user.phone },
      stock: Object.fromEntries(products.map((p) => [p.id, p.stock])),
    };
  }

  async updateOrderStatus(code: string, status: OrderStatus, note = '') {
    const order = await this.prisma.order.findUnique({ where: { code } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    if (!ORDER_TRANSITIONS[order.status].includes(status))
      throw new ConflictException(`Không thể chuyển từ "${ORDER_STATUS_LABEL[order.status]}" sang "${ORDER_STATUS_LABEL[status]}"`);

    await this.prisma.$transaction(async (tx) => {
      const data: Prisma.OrderUpdateManyMutationInput = { status };
      if (status === 'COMPLETED') {
        data.paymentStatus = 'PAID'; // COD: giao thành công = đã thu tiền
        data.completedAt = new Date();
      }
      if (status === 'CANCELLED' && order.paymentStatus === 'PAID') data.paymentStatus = 'REFUNDED';
      // Cập nhật có điều kiện theo trạng thái cũ — tránh 2 thao tác đồng thời ghi đè nhau
      const r = await tx.order.updateMany({ where: { id: order.id, status: order.status }, data });
      if (r.count === 0) throw new ConflictException('Đơn hàng vừa được cập nhật bởi người khác, vui lòng tải lại');
      if (status === 'CANCELLED') await restockOrder(tx, order.id);
      await tx.orderStatusHistory.create({ data: { orderId: order.id, status, note } });
    });
    return (await this.getOrder(code)).order;
  }

  async updatePaymentStatus(code: string, paymentStatus: PaymentStatus) {
    const order = await this.prisma.order.findUnique({ where: { code } });
    if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');
    await this.prisma.order.update({ where: { id: order.id }, data: { paymentStatus } });
    return (await this.getOrder(code)).order;
  }

  // ================= Khách hàng (nâng cao) =================

  async listCustomers() {
    const users = await this.prisma.user.findMany({ where: { role: 'CUSTOMER' }, include: { orders: { select: { status: true, total: true } } }, orderBy: { id: 'asc' } });
    return users.map(({ orders, ...u }) => ({
      ...toUserDto(u),
      orderCount: orders.length,
      totalSpent: orders.filter((o) => o.status === 'COMPLETED').reduce((s, o) => s + o.total, 0),
    }));
  }

  // ================= Khuyến mãi (nâng cao) =================

  async promotionSettings() {
    const promotions = await this.prisma.promotion.findMany({ include: { products: true }, orderBy: { id: 'asc' } });
    const fee = await this.prisma.setting.findUnique({ where: { key: SETTING_SHIPPING_FEE } });
    return { promotions: promotions.map(toPromotionDto), settings: { baseShippingFee: Number(fee?.value ?? 30000) } };
  }

  async updatePromotion(id: number, dto: PromotionInputDto) {
    const p = await this.prisma.promotion.findUnique({ where: { id } });
    if (!p) throw new NotFoundException('Không tìm thấy chương trình');
    if (dto.startDate > dto.endDate) throw new BadRequestException('Ngày kết thúc phải sau ngày bắt đầu');
    if (p.type === 'PRODUCT_PERCENT' && (dto.value < 1 || dto.value > 99)) throw new BadRequestException('Phần trăm giảm phải từ 1 đến 99');
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.promotionProduct.deleteMany({ where: { promotionId: id } });
      const valid = p.type === 'PRODUCT_PERCENT' ? await tx.product.findMany({ where: { id: { in: dto.productIds } }, select: { id: true } }) : [];
      return tx.promotion.update({
        where: { id },
        data: {
          name: dto.name,
          value: dto.value,
          minOrderValue: dto.minOrderValue,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          isActive: dto.isActive,
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.conditions !== undefined && { conditions: dto.conditions }),
          products: { create: valid.map((x) => ({ productId: x.id })) },
        },
        include: { products: true },
      });
    });
    return toPromotionDto(updated);
  }

  async updateSettings(baseShippingFee: number) {
    await this.prisma.setting.upsert({
      where: { key: SETTING_SHIPPING_FEE },
      update: { value: String(baseShippingFee) },
      create: { key: SETTING_SHIPPING_FEE, value: String(baseShippingFee) },
    });
    return { baseShippingFee };
  }
}
