import React from 'react';
import { X, Download, FileText } from 'lucide-react';

const PDFPreview = ({ isOpen, onClose, type = 'invoice', data = {} }) => {
  if (!isOpen) return null;

  const renderInvoiceContent = () => (
    <div className="bg-white p-8 text-black">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">GreenSolar</h1>
          <p className="text-gray-600">Solar & Wind Solutions</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
          <p className="text-gray-600">#{data.invoiceNumber || 'INV-2024-001'}</p>
          <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-bold text-gray-800 mb-2">Bill To:</h3>
            <p className="text-gray-700">{data.address || 'Bandra West'}</p>
            <p className="text-gray-700">{data.city || 'Mumbai, Maharashtra 400050'}</p>
            <p className="text-gray-700">{data.phone || '+91 98765 43210'}</p>
          <p className="text-gray-700">{data.phone || '+1 (234) 567-8900'}</p>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 mb-2">From:</h3>
          <p className="text-gray-700">SolarTech Inc.</p>
          <p className="text-gray-700">Andheri East</p>
          <p className="text-gray-700">Mumbai, Maharashtra 400069</p>
          <p className="text-gray-700">+91 22 1234 5678</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left py-2 text-gray-800">Description</th>
            <th className="text-right py-2 text-gray-800">Qty</th>
            <th className="text-right py-2 text-gray-800">Rate</th>
            <th className="text-right py-2 text-gray-800">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="py-3 text-gray-700">Solar Panel Installation (5kW)</td>
            <td className="text-right py-3 text-gray-700">1</td>
            <td className="text-right py-3 text-gray-700">₹2,00,000</td>
            <td className="text-right py-3 text-gray-700">₹2,00,000</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-3 text-gray-700">Inverter System</td>
            <td className="text-right py-3 text-gray-700">1</td>
            <td className="text-right py-3 text-gray-700">₹30,000</td>
            <td className="text-right py-3 text-gray-700">₹30,000</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-3 text-gray-700">Installation & Setup</td>
            <td className="text-right py-3 text-gray-700">1</td>
            <td className="text-right py-3 text-gray-700">₹20,000</td>
            <td className="text-right py-3 text-gray-700">₹20,000</td>
          </tr>
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span className="text-gray-700">Subtotal:</span>
            <span className="text-gray-700">₹2,50,000</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-700">GST (18%):</span>
            <span className="text-gray-700">₹45,000</span>
          </div>
          <div className="flex justify-between py-2 border-t-2 border-gray-300 font-bold text-lg">
            <span className="text-gray-800">Total:</span>
            <span className="text-gray-800">₹{data.amount?.toLocaleString() || '2,95,000'}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-600 text-sm">
        <p>Thank you for choosing SolarTech!</p>
        <p>Payment due within 30 days. Questions? Contact us at billing@solartech.com</p>
      </div>
    </div>
  );

  const renderQuotationContent = () => (
    <div className="bg-white p-8 text-black">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">GreenSolar</h1>
          <p className="text-gray-600">Solar & Wind Solutions</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-800">QUOTATION</h2>
          <p className="text-gray-600">#{data.quoteNumber || 'QUO-2024-001'}</p>
          <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
          <p className="text-gray-600">Valid until: {new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-800 mb-2">Prepared For:</h3>
        <p className="text-gray-700">{data.customerName || 'Prospective Customer'}</p>
        <p className="text-gray-700">{data.address || 'Customer Address'}</p>
        <p className="text-gray-700">{data.phone || 'Customer Phone'}</p>
      </div>

      {/* Project Details */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-800 mb-4">Project Overview</h3>
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-gray-700 mb-2"><strong>System Type:</strong> Residential Solar Installation</p>
          <p className="text-gray-700 mb-2"><strong>Capacity:</strong> 5kW Solar System</p>
          <p className="text-gray-700 mb-2"><strong>Estimated Annual Savings:</strong> $1,200 - $1,500</p>
          <p className="text-gray-700"><strong>Installation Timeline:</strong> 7-10 business days</p>
        </div>
      </div>

      {/* Items */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left py-2 text-gray-800">Item</th>
            <th className="text-right py-2 text-gray-800">Qty</th>
            <th className="text-right py-2 text-gray-800">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="py-3 text-gray-700">High-Efficiency Solar Panels (300W each)</td>
            <td className="text-right py-3 text-gray-700">16</td>
            <td className="text-right py-3 text-gray-700">₹1,20,000</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-3 text-gray-700">Premium Inverter System</td>
            <td className="text-right py-3 text-gray-700">1</td>
            <td className="text-right py-3 text-gray-700">₹35,000</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-3 text-gray-700">Professional Installation & Setup</td>
            <td className="text-right py-3 text-gray-700">1</td>
            <td className="text-right py-3 text-gray-700">₹25,000</td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="py-3 text-gray-700">10-Year Comprehensive Warranty</td>
            <td className="text-right py-3 text-gray-700">1</td>
            <td className="text-right py-3 text-gray-700">Included</td>
          </tr>
        </tbody>
      </table>

      {/* Total */}
      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2 border-t-2 border-gray-300 font-bold text-xl">
            <span className="text-gray-800">Total Investment:</span>
            <span className="text-blue-600">₹{data.amount?.toLocaleString() || '1,80,000'}</span>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="text-sm text-gray-600">
        <h4 className="font-bold text-gray-800 mb-2">Terms & Conditions:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Quote valid for 30 days from date of issue</li>
          <li>50% deposit required to commence work</li>
          <li>Balance due upon completion</li>
          <li>All work covered by comprehensive warranty</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-100 rounded-lg max-w-4xl w-full h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">
              {type === 'invoice' ? 'Invoice Preview' : 'Quotation Preview'}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => alert('PDF downloaded!')}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="bg-white shadow-lg max-w-3xl mx-auto">
            {type === 'invoice' ? renderInvoiceContent() : renderQuotationContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;