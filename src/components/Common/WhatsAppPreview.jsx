import React from 'react';
import { MessageSquare, X, Send, Paperclip } from 'lucide-react';

const WhatsAppPreview = ({ isOpen, onClose, message, type = 'quotation', customerName, amount }) => {
  if (!isOpen) return null;

  const formatMessage = () => {
    if (type === 'quotation') {
      return `🌞 *SolarTech Quotation*
      return \`🌞 *GreenSolar Quotation*

Dear ${customerName},

Thank you for your interest in our solar solutions!

💰 *Quotation Amount:* ₹${amount?.toLocaleString()}
📋 *Project Details:* Residential Solar Installation
⚡ *System Capacity:* 5kW
🔋 *Battery Backup:* Included
📅 *Installation Timeline:* 7-10 days

✅ *What's Included:*
• High-efficiency solar panels
• Premium inverter system
• Professional installation
• 10-year warranty
• Free maintenance (1st year)

📞 Contact us to proceed or ask questions!

Best regards,
GreenSolar Team`;
    } else if (type === 'invoice') {
      return `🧾 *GreenSolar Invoice*

Dear ${customerName},

Your project has been completed successfully! 🎉

💰 *Invoice Amount:* ₹${amount?.toLocaleString()}
📋 *Project:* Solar Installation Complete
📅 *Completion Date:* ${new Date().toLocaleDateString()}

📎 *Attached Documents:*
• Final Invoice (PDF)
• Installation Certificate
• Warranty Documents

💳 *Payment Options:*
• Bank Transfer
• Online Payment
• UPI/Digital Payment

Thank you for choosing GreenSolar! ⚡

Best regards,
GreenSolar Team`;
    }
    return message;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* WhatsApp Header */}
        <div className="bg-green-500 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-6 h-6" />
            <div>
              <h3 className="font-medium">WhatsApp Business</h3>
              <p className="text-sm opacity-90">Sending to {customerName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-green-600 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Preview */}
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
              {formatMessage()}
            </pre>
          </div>
          
          {type === 'invoice' && (
            <div className="mt-3 p-3 bg-gray-50 rounded flex items-center space-x-2">
              <Paperclip className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">invoice_${Date.now()}.pdf</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Simulate sending
              setTimeout(() => {
                onClose();
              }, 1000);
            }}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppPreview;