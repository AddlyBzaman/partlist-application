import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const productKey = params.id;

    if (!productKey) {
      return NextResponse.json(
        { error: "Product identifier is required" },
        { status: 400 },
      );
    }

    // Delete product from partlist table using NOPROD/NO_PART/PRODUK as available identifiers
    const [result] = await db.query(
      "DELETE FROM partlist WHERE NOPROD = ? OR NO_PART = ? OR PRODUK = ?",
      [productKey, productKey, productKey],
    );

    return NextResponse.json({
      success: true,
      message: "Produk berhasil dihapus",
      deletedRows: (result as any).affectedRows || 0,
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
