// lib/stock-utils.ts

/**
 * Calcula a quantidade real de entrada baseada no código lido
 * @param product O produto encontrado no banco
 * @param barcodeRead O código que veio no XML da nota
 * @param quantityInXml A quantidade que consta na nota fiscal
 */
export function calculateStockEntry(product: any, barcodeRead: string, quantityInXml: number) {
  // Se o código lido for o código de compra (DUN), multiplicamos pelo fator
  if (product.purchaseBarcode === barcodeRead) {
    return quantityInXml * (product.conversionFactor || 1);
  }

  // Se for o EAN normal ou se não houver código de compra, somamos a quantidade seca
  return quantityInXml;
}