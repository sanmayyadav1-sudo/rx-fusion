import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authHelpers";
import { ArticleOrderService } from "@/lib/articleOrderService";
import { OrderStatus } from "@/types/articleOrder";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const searchParams = request.nextUrl.searchParams;
    const service_type = searchParams.get("service_type") || undefined;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const date = searchParams.get("date") || undefined;

    const [orders, summary] = await Promise.all([
      ArticleOrderService.getAllOrders({ service_type, status, search, date }),
      ArticleOrderService.getSummary()
    ]);

    return NextResponse.json({
      orders,
      summary
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to load article orders";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();
    const { id, status, internal_notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    const updated = await ArticleOrderService.updateOrderStatusAndNotes(id, {
      status: status as OrderStatus,
      internal_notes
    });

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update article order";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Order ID required" }, { status: 400 });
    }

    await ArticleOrderService.deleteOrder(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete article order";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
