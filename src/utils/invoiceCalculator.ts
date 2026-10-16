export interface TaxBreakdown {
  grandTotal: number;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  amountInWords: string;
}

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const TEENS = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertUnderThousand(num: number): string {
  let str = '';
  if (num >= 100) {
    str += ONES[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  if (num >= 20) {
    str += TENS[Math.floor(num / 10)] + ' ';
    num %= 10;
  } else if (num >= 10) {
    str += TEENS[num - 10] + ' ';
    return str;
  }
  if (num > 0) {
    str += ONES[num] + ' ';
  }
  return str;
}

export function numberToWordsIndian(amount: number): string {
  const integerPart = Math.floor(amount);
  if (integerPart === 0) return 'Zero Rupees Only';

  let remaining = integerPart;
  let words = '';

  const crores = Math.floor(remaining / 10000000);
  remaining %= 10000000;
  if (crores > 0) words += convertUnderThousand(crores) + 'Crore ';

  const lakhs = Math.floor(remaining / 100000);
  remaining %= 100000;
  if (lakhs > 0) words += convertUnderThousand(lakhs) + 'Lakh ';

  const thousands = Math.floor(remaining / 1000);
  remaining %= 1000;
  if (thousands > 0) words += convertUnderThousand(thousands) + 'Thousand ';

  if (remaining > 0) words += convertUnderThousand(remaining);

  return `${words.trim()} Rupees Only`;
}

export function calculateInvoiceTaxes(totalAmount: number): TaxBreakdown {
  const grandTotal = Math.round(totalAmount * 100) / 100;
  const baseRate = Math.round((grandTotal / 1.18) * 100) / 100;
  const totalTax = Math.round((grandTotal - baseRate) * 100) / 100;
  const cgst = Math.round((totalTax / 2) * 100) / 100;
  const sgst = Math.round((totalTax - cgst) * 100) / 100;

  return {
    grandTotal,
    subtotal: baseRate,
    cgst,
    sgst,
    igst: 0,
    amountInWords: numberToWordsIndian(grandTotal),
  };
}

export function generateInvoiceHTML(data: {
  invoiceNumber: string;
  date: string;
  studentName: string;
  studentAddress?: string;
  course: string;
  amount: number;
}): string {
  const taxes = calculateInvoiceTaxes(data.amount);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tax Invoice - ${data.invoiceNumber}</title>
        <style>
          @page { size: A4 portrait; margin: 10mm; }
          body { font-family: Arial, sans-serif; color: #000; margin: 0; padding: 15px; font-size: 11px; background: #fff; }
          .invoice-box { border: 2px solid #000; width: 100%; max-width: 780px; margin: 0 auto; box-sizing: border-box; }
          .header { text-align: center; border-bottom: 1.5px solid #000; padding: 12px 10px; }
          .header h2 { margin: 0 0 5px 0; font-size: 17px; font-weight: bold; }
          .header p { margin: 2px 0; font-size: 11px; }
          .meta-row { display: flex; border-bottom: 1.5px solid #000; }
          .meta-col { flex: 1; padding: 6px 10px; border-right: 1.5px solid #000; text-align: center; font-size: 10.5px; }
          .meta-col:last-child { border-right: none; }
          .tax-bar { display: flex; justify-content: space-between; border-bottom: 1.5px solid #000; padding: 6px 12px; font-weight: bold; font-size: 12px; }
          .bill-row { display: flex; border-bottom: 1.5px solid #000; min-height: 65px; }
          .bill-to { flex: 1; border-right: 1.5px solid #000; padding: 8px 10px; line-height: 1.4; }
          .inv-info { flex: 1; padding: 8px 10px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border-bottom: 1.5px solid #000; border-right: 1.5px solid #000; padding: 6px 8px; font-size: 11px; }
          th:last-child, td:last-child { border-right: none; }
          th { font-weight: bold; text-align: left; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .summary-table { width: 100%; border-collapse: collapse; }
          .summary-table td { border-bottom: 1.5px solid #000; border-right: 1.5px solid #000; padding: 5px 8px; font-size: 11px; }
          .summary-table td:last-child { border-right: none; text-align: right; }
          .grand-total-row { font-weight: bold; font-size: 12px; }
          .words-bar { padding: 6px 10px; border-bottom: 1.5px solid #000; text-align: right; font-size: 11px; font-weight: 500; }
          .terms { padding: 8px 10px; border-bottom: 1.5px solid #000; }
          .terms h4 { margin: 0 0 4px 0; font-size: 11px; }
          .terms p { margin: 2px 0; font-size: 10.5px; }
          .footer-box { display: flex; min-height: 110px; }
          .bank-col { flex: 1; border-right: 1.5px solid #000; padding: 8px 10px; }
          .bank-col h4 { margin: 0 0 6px 0; font-size: 11px; }
          .bank-col p { margin: 2px 0; font-size: 10.5px; }
          .sign-col { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end; padding: 12px; }
          .sign-line { width: 180px; text-align: center; font-weight: bold; font-size: 11px; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <h2>Radiquolab Private Limited</h2>
            <p>Horizon Chambers, Shop No. 6, GAT NO 281/2, Plot No 26, Kasar Amboli Ghotavade, Pirangut, Mulshi, Pune 412115</p>
          </div>

          <div class="meta-row">
            <div class="meta-col">Mobile: +91-9145272921</div>
            <div class="meta-col">Email: info@radiquolab.com</div>
          </div>

          <div class="meta-row">
            <div class="meta-col">GSTIN: 27AANCR8297C1ZT</div>
            <div class="meta-col">Company PAN: AANCR8297C</div>
            <div class="meta-col">IEC Code: AANCR8297C</div>
          </div>

          <div class="tax-bar">
            <span>Tax Invoice</span>
            <span>Date: ${data.date}</span>
          </div>

          <div class="bill-row">
            <div class="bill-to">
              <strong>Bill To</strong><br/>
              ${data.studentName}<br/>
              ${data.studentAddress || 'Pune'}
            </div>
            <div class="inv-info">
              <strong>Invoice No:</strong> ${data.invoiceNumber}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px;" class="text-center">Sr. No</th>
                <th>Description</th>
                <th style="width: 70px;" class="text-center">Hsn/Sac</th>
                <th style="width: 60px;" class="text-center">Qty/Hrs</th>
                <th style="width: 85px;" class="text-right">Rate</th>
                <th style="width: 60px;" class="text-center">Currency</th>
                <th style="width: 90px;" class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-center">1</td>
                <td>${data.course} Training</td>
                <td class="text-center">9992</td>
                <td class="text-center">1</td>
                <td class="text-right">${taxes.subtotal.toFixed(2)}</td>
                <td class="text-center">INR</td>
                <td class="text-right">${taxes.subtotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <table class="summary-table">
            <tbody>
              <tr>
                <td style="border-right: none;"></td>
                <td style="width: 140px; font-weight: bold;">Sub Total</td>
                <td style="width: 90px;">${taxes.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="border-right: none;"></td>
                <td>CGST @ 9%</td>
                <td>${taxes.cgst.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="border-right: none;"></td>
                <td>SGST @ 9%</td>
                <td>${taxes.sgst.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="border-right: none;"></td>
                <td>IGST @ 0%</td>
                <td>00.00</td>
              </tr>
              <tr class="grand-total-row">
                <td style="border-right: none;"></td>
                <td>Grand Total</td>
                <td>${taxes.grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div class="words-bar">
            <strong>In Words:</strong> ${taxes.amountInWords}
          </div>

          <div class="terms">
            <h4>Terms And Conditions</h4>
            <p>Payment Term: 15 Days</p>
            <p>Due Date: ${data.date}</p>
          </div>

          <div class="footer-box">
            <div class="bank-col">
              <h4>Bank Details:</h4>
              <p>Bank Name: State Bank of India</p>
              <p>Branch: Pirangut</p>
              <p>Account Name: Radiquolab Private Limited</p>
              <p>Account No: 20523204478</p>
              <p>IFS Code: SBIN0011430</p>
              <p>Swift Code: SBININBB238</p>
            </div>
            <div class="sign-col">
              <div class="sign-line">Authorised Signature</div>
            </div>
          </div>
        </div>
        <script>
          window.print();
        </script>
      </body>
    </html>
  `;
}