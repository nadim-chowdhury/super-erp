"use client";

import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import { format } from "date-fns";
import { ExportData, preparePDFData } from "@/lib/utils/exportUtils";
import React from "react";

// Create styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2 solid #000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
  },
  table: {
    marginTop: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #ddd",
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    paddingVertical: 10,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 10,
    color: "#666",
  },
});

interface PDFDocumentProps {
  data: ExportData;
}

const PDFDocument: React.FC<PDFDocumentProps> = ({ data }) => {
  const pdfData = preparePDFData(data);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{pdfData.title}</Text>
          <Text style={styles.subtitle}>
            Generated on {pdfData.generatedAt}
          </Text>
        </View>

        <View style={styles.table}>
          {/* Header Row */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            {pdfData.headers.map((header, index) => (
              <Text key={index} style={styles.tableCell}>
                {header}
              </Text>
            ))}
          </View>

          {/* Data Rows */}
          {pdfData.rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              {row.map((cell, cellIndex) => (
                <Text key={cellIndex} style={styles.tableCell}>
                  {String(cell)}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Page 1 of 1 • {pdfData.title} • {pdfData.generatedAt}
        </Text>
      </Page>
    </Document>
  );
};

export async function exportToPDF(data: ExportData, filename?: string) {
  const doc = <PDFDocument data={data} />;
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || `report-${format(new Date(), "yyyy-MM-dd")}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

