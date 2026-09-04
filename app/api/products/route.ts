import { getCatalogProducts } from "@/lib/catalog";
import { NextResponse } from "next/server";

export async function GET() {
  const products = await getCatalogProducts();
  return NextResponse.json(products);
}
