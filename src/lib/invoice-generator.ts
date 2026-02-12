// Dynamically import jsPDF to avoid SSR/Node build issues
export const generateInvoicePDF = async (order: any) => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Define colors
    const primaryColor = [40, 40, 40]; // Dark Grey
    const secondaryColor = [100, 100, 100]; // Light Grey

    // --- LOGO ---
    try {
        const logoUrl = "/we_naturals_logo.png";
        const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.src = logoUrl;
            img.onload = () => resolve(img);
            img.onerror = reject;
        });

        // Add logo (x, y, w, h)
        doc.addImage(logoImg, "PNG", margin, yPos - 5, 40, 15);
    } catch (e) {
        console.warn("Logo failed to load", e);
        // Fallback text if logo fails
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text("We Naturals", margin, yPos + 10);
    }

    // --- HEADER INFO ---
    // Invoice Label & ID
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("INVOICE", pageWidth - margin, yPos, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text(`#${order.id.slice(0, 8).toUpperCase()}`, pageWidth - margin, yPos + 6, { align: "right" });
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, pageWidth - margin, yPos + 12, { align: "right" });

    // Add GST Number below Date
    const GST_NUMBER = "27ABCDE1234F1Z5"; // Placeholder GST
    doc.text(`GSTIN: ${GST_NUMBER}`, pageWidth - margin, yPos + 18, { align: "right" });

    yPos += 30;

    // --- DIVIDER ---
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    // --- BILLING DETAILS ---
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Bill To:", margin, yPos);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    yPos += 6;
    doc.text(order.customer_name || "Valued Customer", margin, yPos);
    yPos += 5;
    if (order.shipping_address) {
        doc.text(order.shipping_address.street || "", margin, yPos);
        yPos += 5;
        doc.text(`${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.pincode}`, margin, yPos);
        yPos += 5;
        if (order.shipping_address.phone) doc.text(`Phone: ${order.shipping_address.phone}`, margin, yPos);
    }

    yPos += 20;

    // --- ITEM TABLE HEADER ---
    const col1 = margin;
    const col2 = pageWidth - 60; // Price
    const col3 = pageWidth - 40; // Qty
    const col4 = pageWidth - margin; // Total

    // Background for header
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPos - 5, pageWidth - (margin * 2), 10, 'F');

    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Item", col1 + 5, yPos + 1);
    doc.text("Price", col2, yPos + 1, { align: "right" });
    doc.text("Qty", col3, yPos + 1, { align: "center" });
    doc.text("Total", col4 - 5, yPos + 1, { align: "right" });

    yPos += 12;

    // --- ITEMS ---
    doc.setFont("helvetica", "normal");
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);

    order.items.forEach((item: any) => {
        const name = item.product?.name || item.product_name || item.name || "Artifact";
        const price = item.price_at_purchase;
        const total = price * item.quantity;

        // Handle long item names
        let splitName = doc.splitTextToSize(name, 90); // Wrap at 90 units

        doc.text(splitName, col1 + 5, yPos);
        doc.text(Number(price).toFixed(2), col2, yPos, { align: "right" });
        doc.text(String(item.quantity), col3, yPos, { align: "center" });
        doc.text(Number(total).toFixed(2), col4 - 5, yPos, { align: "right" });

        yPos += (splitName.length * 6) + 4; // Dynamic spacing based on lines
    });

    yPos += 5;
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // --- TOTALS ---
    const totalX = pageWidth - margin - 5;
    const labelX = pageWidth - margin - 50;

    doc.text("Subtotal:", labelX, yPos, { align: "right" });
    doc.text(Number(order.total_amount).toFixed(2), totalX, yPos, { align: "right" });
    yPos += 6;

    doc.text("Shipping:", labelX, yPos, { align: "right" });
    doc.text("0.00", totalX, yPos, { align: "right" });
    yPos += 8;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Total Essence:", labelX, yPos, { align: "right" });
    doc.text(`Rs. ${Number(order.total_amount).toFixed(2)}`, totalX, yPos, { align: "right" });

    // --- FOOTER ---
    yPos += 30;
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    doc.text("Thank you for choosing We Naturals.", pageWidth / 2, yPos, { align: "center" });
    doc.text("This is a computer-generated invoice.", pageWidth / 2, yPos + 5, { align: "center" });

    // Save
    doc.save(`WeNaturals_Invoice_${order.id.slice(0, 8)}.pdf`);
};
