import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const produkId = params.id;

    // Start transaction
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Delete items first (due to foreign key constraint)
      const [delItemsResult] = (await connection.execute(
        "DELETE FROM partlist_produk_items WHERE produk_id = ?",
        [produkId],
      )) as any[];

      // Delete main produk record
      const [delProdukResult] = (await connection.execute(
        "DELETE FROM partlist_produk WHERE id = ?",
        [produkId],
      )) as any[];

      await connection.commit();

      // Log results so we can inspect in Vercel logs
      console.log("Part List Produk deleted successfully:", {
        produkId,
        delItemsAffected: delItemsResult?.affectedRows ?? null,
        delProdukAffected: delProdukResult?.affectedRows ?? null,
        DB_HOST: process.env.DB_HOST || "unknown",
      });

      try {
        // Revalidate laporan page so CDN/static cache updates on demand
        revalidatePath("/dashboard/laporan/part-list-produk");
        console.log(
          "[DEBUG] revalidated path /dashboard/laporan/part-list-produk",
        );
      } catch (err) {
        console.error("[DEBUG] revalidatePath failed:", err);
      }

      return NextResponse.json(
        { message: "Part List Produk berhasil dihapus" },
        { status: 200, headers: { "Cache-Control": "no-store" } },
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting part list produk:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
