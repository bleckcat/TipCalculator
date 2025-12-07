import { CalculationStaff } from '@/types';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export async function generateTipsPDF(
  staffMembers: CalculationStaff[],
  totalAmount: number,
  mealPeriod: 'lunch' | 'dinner',
  date: string
) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const mealPeriodText = mealPeriod === 'lunch' ? 'Lunch' : 'Dinner';

  // Generate HTML for the PDF with dotted borders for cutting
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 10px;
            margin: 0;
          }
          .header {
            text-align: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #333;
          }
          .header h1 {
            margin: 0;
            font-size: 18px;
            color: #333;
          }
          .header p {
            margin: 3px 0;
            color: #666;
            font-size: 12px;
          }
          .tip-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0;
            page-break-inside: avoid;
          }
          .tip-cell {
            border: 2px dashed #999;
            padding: 8px;
            min-height: 70px;
            box-sizing: border-box;
            page-break-inside: avoid;
          }
          .tip-cell .name {
            font-size: 12px;
            font-weight: bold;
            color: #333;
            margin-bottom: 4px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 3px;
          }
          .tip-cell .info {
            font-size: 9px;
            color: #666;
            margin: 2px 0;
            line-height: 1.3;
          }
          .tip-cell .amount {
            font-size: 14px;
            font-weight: bold;
            color: #2E7D32;
            margin-top: 4px;
          }
          .tip-cell .role {
            color: #1976D2;
            font-weight: 600;
          }
          .tip-cell .date {
            font-size: 8px;
            color: #999;
            margin-top: 3px;
          }
          @media print {
            body {
              padding: 5px;
            }
            .tip-cell {
              page-break-inside: avoid;
            }
          }
          .scissors-icon {
            text-align: center;
            color: #999;
            font-size: 14px;
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Tip Distribution - ${mealPeriodText}</h1>
          <p>${formattedDate}</p>
          <p>Total: $${totalAmount.toFixed(2)}</p>
        </div>
        
        <div class="scissors-icon">✂️ Cut along dotted lines ✂️</div>
        
        <div class="tip-grid">
          ${staffMembers
            .map(
              (staff) => `
            <div class="tip-cell">
              <div class="name">${staff.staffName} <span style="font-size: 10px; font-weight: normal; color: #666;">(${mealPeriodText})</span></div>
              <div class="info"><span class="role">${staff.role.name}</span> • ${staff.customPercentage}% • Pool ${staff.pool === 'pool1' ? '1' : '2'}</div>
              <div class="amount">$${staff.tipAmount.toFixed(2)}</div>
              <div class="date">${formattedDate}</div>
            </div>
          `
            )
            .join('')}
        </div>
        
        <div class="scissors-icon" style="margin-top: 10px;">✂️</div>
      </body>
    </html>
  `;

  try {
    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
      width: 595,
      height: 842,
    });

    // Share/Save the PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save or Share Tips PDF',
        UTI: 'com.adobe.pdf',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }

    return uri;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
