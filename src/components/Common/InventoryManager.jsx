// import React, { useState } from 'react';
// // import { useApp } from '../../context/AppContext.jsx';
// import { useApp } from '../../hooks/useApp.js'
// import { INVENTORY_STATUS, INVENTORY_COMPANIES } from '../../types/index.js';
// import { 
//   Package, 
//   Plus, 
//   Search, 
//   Filter,
//   Edit,
//   Trash2,
//   Eye,
//   Building,
//   Scan,
//   AlertCircle,
//   CheckCircle,
//   Clock,
//   X,
//   Users,
//   Calendar,
//   DollarSign,
//   MapPin
// } from 'lucide-react';

// const InventoryManager = () => {
//   const { currentUser, inventory, projects, dispatch, showToast } = useApp();
//   const [selectedCompany, setSelectedCompany] = useState('');
//   const [showAddForm, setShowAddForm] = useState(false);
//   const [showAssignModal, setShowAssignModal] = useState(false);
//   const [showItemDetails, setShowItemDetails] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [newItem, setNewItem] = useState({
//     company: '',
//     serialNumber: '',
//     type: 'solar_panel',
//     model: '',
//     specifications: {
//       wattage: '',
//       efficiency: '',
//       dimensions: '',
//       weight: ''
//     },
//     location: '',
//     cost: '',
//     warrantyExpiry: '',
//     purchaseDate: new Date().toISOString().split('T')[0]
//   });
//   const [assignmentData, setAssignmentData] = useState({
//     projectId: '',
//     serialNumbers: [],
//     assignedTo: ''
//   });

//   // Only allow admin access
//   if (currentUser?.role !== 'company') {
//     return (
//       <div className="text-center py-8">
//         <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
//         <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
//         <p className="text-gray-600">Only administrators can manage inventory.</p>
//       </div>
//     );
//   }

//   const companyOptions = Object.entries(INVENTORY_COMPANIES).map(([key, value]) => ({
//     value,
//     label: value.split('_').map(word => 
//       word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
//     ).join(' ')
//   }));

//   const filteredInventory = inventory.filter(item => {
//     const matchesSearch = !searchTerm || 
//       item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    
//     const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
//     const matchesCompany = !selectedCompany || item.company === selectedCompany;
    
//     return matchesSearch && matchesStatus && matchesCompany;
//   });

//   const getInventoryStats = (company = null) => {
//     const items = company ? inventory.filter(i => i.company === company) : inventory;
//     return {
//       total: items.length,
//       inStock: items.filter(i => i.status === INVENTORY_STATUS.IN_STOCK).length,
//       assigned: items.filter(i => i.status === INVENTORY_STATUS.ASSIGNED).length,
//       installed: items.filter(i => i.status === INVENTORY_STATUS.INSTALLED).length,
//       maintenance: items.filter(i => i.status === INVENTORY_STATUS.MAINTENANCE).length,
//       totalValue: items.reduce((sum, i) => sum + (i.cost || 0), 0)
//     };
//   };

//   const handleAddItem = (e) => {
//     e.preventDefault();
    
//     if (!newItem.serialNumber || !newItem.company) {
//       showToast('Serial number and company are required', 'error');
//       return;
//     }

//     // Check for duplicate serial number
//     const existingItem = inventory.find(i => i.serialNumber === newItem.serialNumber);
//     if (existingItem) {
//       showToast('Serial number already exists', 'error');
//       return;
//     }

//     const item = {
//       id: `inv-${Date.now()}`,
//       ...newItem,
//       companyName: companyOptions.find(c => c.value === newItem.company)?.label || newItem.company,
//       status: INVENTORY_STATUS.IN_STOCK,
//       addedBy: currentUser.id,
//       addedByName: currentUser.name,
//       addedAt: new Date().toISOString()
//     };

//     dispatch({ type: 'ADD_INVENTORY_ITEM', payload: item });
//     showToast('Inventory item added successfully!');
//     setShowAddForm(false);
//     setNewItem({
//       company: '',
//       serialNumber: '',
//       type: 'solar_panel',
//       model: '',
//       specifications: {
//         wattage: '',
//         efficiency: '',
//         dimensions: '',
//         weight: ''
//       },
//       location: '',
//       cost: '',
//       warrantyExpiry: '',
//       purchaseDate: new Date().toISOString().split('T')[0]
//     });
//   };

//   const handleAssignToProject = () => {
//     if (!assignmentData.projectId || assignmentData.serialNumbers.length === 0) {
//       showToast('Please select a project and at least one item', 'error');
//       return;
//     }

//     const project = projects.find(p => p.id === assignmentData.projectId);
//     if (!project) {
//       showToast('Project not found', 'error');
//       return;
//     }

//     // Update inventory status and assign to project
//     assignmentData.serialNumbers.forEach(serialNumber => {
//       dispatch({
//         type: 'UPDATE_INVENTORY_STATUS',
//         payload: {
//           serialNumber,
//           status: INVENTORY_STATUS.ASSIGNED,
//           updates: {
//             assignedTo: assignmentData.projectId,
//             assignedDate: new Date().toISOString().split('T')[0],
//             assignedBy: currentUser.id
//           }
//         }
//       });
//     });

//     // Update project with assigned serial numbers
//     dispatch({
//       type: 'UPDATE_PROJECT',
//       payload: {
//         id: assignmentData.projectId,
//         updates: {
//           serialNumbers: [...(project.serialNumbers || []), ...assignmentData.serialNumbers]
//         }
//       }
//     });

//     showToast(`${assignmentData.serialNumbers.length} items assigned to ${project.title}`);
//     setShowAssignModal(false);
//     setAssignmentData({
//       projectId: '',
//       serialNumbers: [],
//       assignedTo: ''
//     });
//   };

//   const handleMarkAsInstalled = (serialNumber) => {
//     dispatch({
//       type: 'UPDATE_INVENTORY_STATUS',
//       payload: {
//         serialNumber,
//         status: INVENTORY_STATUS.INSTALLED,
//         updates: {
//           installDate: new Date().toISOString().split('T')[0],
//           installedBy: currentUser.id
//         }
//       }
//     });
//     showToast('Item marked as installed');
//   };

//   const CompanyCard = ({ company, stats }) => (
//     <div 
//       className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
//         selectedCompany === company.value 
//           ? 'border-blue-500 bg-blue-50' 
//           : 'border-gray-200 hover:border-gray-300 bg-white'
//       }`}
//       onClick={() => setSelectedCompany(selectedCompany === company.value ? '' : company.value)}
//     >
//       <div className="flex items-center justify-between mb-3">
//         <div className="flex items-center space-x-2">
//           <Building className="w-5 h-5 text-blue-600" />
//           <h3 className="font-medium text-gray-900">{company.label}</h3>
//         </div>
//         <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
//       </div>
      
//       <div className="grid grid-cols-2 gap-2 text-sm">
//         <div className="flex justify-between">
//           <span className="text-gray-600">In Stock:</span>
//           <span className="font-medium text-green-600">{stats.inStock}</span>
//         </div>
//         <div className="flex justify-between">
//           <span className="text-gray-600">Assigned:</span>
//           <span className="font-medium text-blue-600">{stats.assigned}</span>
//         </div>
//         <div className="flex justify-between">
//           <span className="text-gray-600">Installed:</span>
//           <span className="font-medium text-purple-600">{stats.installed}</span>
//         </div>
//         <div className="flex justify-between">
//           <span className="text-gray-600">Value:</span>
//           <span className="font-medium text-gray-900">₹{stats.totalValue.toLocaleString()}</span>
//         </div>
//       </div>
//     </div>
//   );

//   const ItemRow = ({ item }) => {
//     const project = projects.find(p => p.serialNumbers?.includes(item.serialNumber));
    
//     return (
//       <tr className="hover:bg-gray-50">
//         <td className="px-6 py-4 whitespace-nowrap">
//           <div className="flex items-center">
//             <Package className="w-5 h-5 text-gray-400 mr-3" />
//             <div>
//               <div className="text-sm font-medium text-gray-900">{item.serialNumber}</div>
//               <div className="text-sm text-gray-500">{item.model}</div>
//             </div>
//           </div>
//         </td>
//         <td className="px-6 py-4 whitespace-nowrap">
//           <div className="text-sm text-gray-900">{item.companyName}</div>
//           <div className="text-sm text-gray-500 capitalize">{item.type.replace('_', ' ')}</div>
//         </td>
//         <td className="px-6 py-4 whitespace-nowrap">
//           <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
//             item.status === INVENTORY_STATUS.IN_STOCK
//               ? 'bg-green-100 text-green-800'
//               : item.status === INVENTORY_STATUS.ASSIGNED
//               ? 'bg-blue-100 text-blue-800'
//               : item.status === INVENTORY_STATUS.INSTALLED
//               ? 'bg-purple-100 text-purple-800'
//               : item.status === INVENTORY_STATUS.MAINTENANCE
//               ? 'bg-yellow-100 text-yellow-800'
//               : 'bg-gray-100 text-gray-800'
//           }`}>
//             {item.status.replace('_', ' ')}
//           </span>
//         </td>
//         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//           {project ? (
//             <div>
//               <div className="font-medium">{project.title}</div>
//               <div className="text-gray-500">Ref: {project.customerRefNumber}</div>
//             </div>
//           ) : (
//             <span className="text-gray-400">Unassigned</span>
//           )}
//         </td>
//         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//           ₹{item.cost?.toLocaleString() || 'N/A'}
//         </td>
//         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//           {item.location}
//         </td>
//         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => {
//                 setSelectedItem(item);
//                 setShowItemDetails(true);
//               }}
//               className="text-blue-600 hover:text-blue-900"
//             >
//               <Eye className="w-4 h-4" />
//             </button>
//             {item.status === INVENTORY_STATUS.IN_STOCK && (
//               <button
//                 onClick={() => {
//                   setSelectedItem(item);
//                   setAssignmentData({
//                     ...assignmentData,
//                     serialNumbers: [item.serialNumber]
//                   });
//                   setShowAssignModal(true);
//                 }}
//                 className="text-green-600 hover:text-green-900"
//               >
//                 <Users className="w-4 h-4" />
//               </button>
//             )}
//             {item.status === INVENTORY_STATUS.ASSIGNED && (
//               <button
//                 onClick={() => handleMarkAsInstalled(item.serialNumber)}
//                 className="text-purple-600 hover:text-purple-900"
//               >
//                 <CheckCircle className="w-4 h-4" />
//               </button>
//             )}
//           </div>
//         </td>
//       </tr>
//     );
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
//           <p className="text-gray-600">Manage equipment by company and track serial numbers</p>
//         </div>
//         <button
//           onClick={() => setShowAddForm(true)}
//           className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           <Plus className="w-4 h-4 mr-2" />
//           Add Inventory Item
//         </button>
//       </div>

//       {/* Company Overview Cards */}
//       <div>
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory by Company</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {companyOptions.map(company => {
//             const stats = getInventoryStats(company.value);
//             return (
//               <CompanyCard key={company.value} company={company} stats={stats} />
//             );
//           })}
//         </div>
//       </div>

//       {/* Filters and Search */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
//           <div className="flex items-center space-x-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 placeholder="Search by serial number or model..."
//                 className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
            
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="all">All Status</option>
//               <option value={INVENTORY_STATUS.IN_STOCK}>In Stock</option>
//               <option value={INVENTORY_STATUS.ASSIGNED}>Assigned</option>
//               <option value={INVENTORY_STATUS.INSTALLED}>Installed</option>
//               <option value={INVENTORY_STATUS.MAINTENANCE}>Maintenance</option>
//             </select>
//           </div>

//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => setShowAssignModal(true)}
//               className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
//             >
//               <Users className="w-4 h-4 mr-2" />
//               Bulk Assign
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Inventory Table */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <div className="px-6 py-4 border-b border-gray-200">
//           <h3 className="text-lg font-semibold text-gray-900">
//             {selectedCompany ? 
//               `${companyOptions.find(c => c.value === selectedCompany)?.label} Inventory` : 
//               'All Inventory Items'
//             }
//           </h3>
//           <p className="text-sm text-gray-600 mt-1">
//             {filteredInventory.length} items • Total Value: ₹{getInventoryStats(selectedCompany).totalValue.toLocaleString()}
//           </p>
//         </div>
        
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Item Details
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Company & Type
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Assignment
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Cost
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Location
//                 </th>
//                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredInventory.map(item => (
//                 <ItemRow key={item.id} item={item} />
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Add Item Modal */}
//       {showAddForm && (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900">Add Inventory Item</h3>
//                 <button
//                   onClick={() => setShowAddForm(false)}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>

//               <form onSubmit={handleAddItem} className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Company *
//                     </label>
//                     <select
//                       value={newItem.company}
//                       onChange={(e) => setNewItem({...newItem, company: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       required
//                     >
//                       <option value="">Select Company</option>
//                       {companyOptions.map(company => (
//                         <option key={company.value} value={company.value}>
//                           {company.label}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Serial Number *
//                     </label>
//                     <input
//                       type="text"
//                       value={newItem.serialNumber}
//                       onChange={(e) => setNewItem({...newItem, serialNumber: e.target.value})}
//                       placeholder="e.g., GKA96M560H20200902RX025"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Equipment Type *
//                     </label>
//                     <select
//                       value={newItem.type}
//                       onChange={(e) => setNewItem({...newItem, type: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       required
//                     >
//                       <option value="solar_panel">Solar Panel</option>
//                       <option value="wind_turbine">Wind Turbine</option>
//                       <option value="inverter">Inverter</option>
//                       <option value="battery">Battery</option>
//                       <option value="mounting_system">Mounting System</option>
//                       <option value="monitoring_system">Monitoring System</option>
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Model *
//                     </label>
//                     <input
//                       type="text"
//                       value={newItem.model}
//                       onChange={(e) => setNewItem({...newItem, model: e.target.value})}
//                       placeholder="e.g., SolarMax 400W"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Location *
//                     </label>
//                     <input
//                       type="text"
//                       value={newItem.location}
//                       onChange={(e) => setNewItem({...newItem, location: e.target.value})}
//                       placeholder="e.g., Mumbai Warehouse"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       required
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Cost (₹)
//                     </label>
//                     <input
//                       type="number"
//                       value={newItem.cost}
//                       onChange={(e) => setNewItem({...newItem, cost: e.target.value})}
//                       placeholder="e.g., 15000"
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Purchase Date
//                     </label>
//                     <input
//                       type="date"
//                       value={newItem.purchaseDate}
//                       onChange={(e) => setNewItem({...newItem, purchaseDate: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Warranty Expiry
//                     </label>
//                     <input
//                       type="date"
//                       value={newItem.warrantyExpiry}
//                       onChange={(e) => setNewItem({...newItem, warrantyExpiry: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>
//                 </div>

//                 {/* Specifications */}
//                 <div>
//                   <h4 className="text-md font-medium text-gray-900 mb-4">Technical Specifications</h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Wattage/Capacity
//                       </label>
//                       <input
//                         type="text"
//                         value={newItem.specifications.wattage}
//                         onChange={(e) => setNewItem({
//                           ...newItem, 
//                           specifications: {...newItem.specifications, wattage: e.target.value}
//                         })}
//                         placeholder="e.g., 400W"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Efficiency
//                       </label>
//                       <input
//                         type="text"
//                         value={newItem.specifications.efficiency}
//                         onChange={(e) => setNewItem({
//                           ...newItem, 
//                           specifications: {...newItem.specifications, efficiency: e.target.value}
//                         })}
//                         placeholder="e.g., 21.2%"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Dimensions
//                       </label>
//                       <input
//                         type="text"
//                         value={newItem.specifications.dimensions}
//                         onChange={(e) => setNewItem({
//                           ...newItem, 
//                           specifications: {...newItem.specifications, dimensions: e.target.value}
//                         })}
//                         placeholder="e.g., 2008x1002x40mm"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Weight
//                       </label>
//                       <input
//                         type="text"
//                         value={newItem.specifications.weight}
//                         onChange={(e) => setNewItem({
//                           ...newItem, 
//                           specifications: {...newItem.specifications, weight: e.target.value}
//                         })}
//                         placeholder="e.g., 24kg"
//                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex items-center space-x-3 pt-6">
//                   <button
//                     type="submit"
//                     className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
//                   >
//                     Add to Inventory
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => setShowAddForm(false)}
//                     className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 font-medium"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Assignment Modal */}
//       {showAssignModal && (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg max-w-md w-full p-6">
//             <div className="flex items-center justify-between mb-6">
//               <h3 className="text-lg font-semibold text-gray-900">Assign Equipment to Project</h3>
//               <button
//                 onClick={() => setShowAssignModal(false)}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Select Project *
//                 </label>
//                 <select
//                   value={assignmentData.projectId}
//                   onChange={(e) => setAssignmentData({...assignmentData, projectId: e.target.value})}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   required
//                 >
//                   <option value="">Choose Project</option>
//                   {projects.filter(p => p.status !== 'completed' && p.status !== 'cancelled').map(project => (
//                     <option key={project.id} value={project.id}>
//                       {project.title} (Ref: {project.customerRefNumber})
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Select Items to Assign
//                 </label>
//                 <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
//                   {inventory.filter(item => item.status === INVENTORY_STATUS.IN_STOCK).map(item => (
//                     <label key={item.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={assignmentData.serialNumbers.includes(item.serialNumber)}
//                         onChange={(e) => {
//                           if (e.target.checked) {
//                             setAssignmentData({
//                               ...assignmentData,
//                               serialNumbers: [...assignmentData.serialNumbers, item.serialNumber]
//                             });
//                           } else {
//                             setAssignmentData({
//                               ...assignmentData,
//                               serialNumbers: assignmentData.serialNumbers.filter(s => s !== item.serialNumber)
//                             });
//                           }
//                         }}
//                         className="mr-3"
//                       />
//                       <div className="flex-1">
//                         <div className="font-medium text-gray-900">{item.serialNumber}</div>
//                         <div className="text-sm text-gray-600">{item.companyName} - {item.model}</div>
//                       </div>
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <div className="flex items-center space-x-3 pt-4">
//                 <button
//                   onClick={handleAssignToProject}
//                   className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
//                 >
//                   Assign Items ({assignmentData.serialNumbers.length})
//                 </button>
//                 <button
//                   onClick={() => setShowAssignModal(false)}
//                   className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Item Details Modal */}
//       {showItemDetails && selectedItem && (
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900">Equipment Details</h3>
//                 <button
//                   onClick={() => setShowItemDetails(false)}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>

//               <div className="space-y-6">
//                 {/* Basic Info */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
//                     <div className="space-y-2 text-sm">
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Serial Number:</span>
//                         <span className="font-mono font-medium">{selectedItem.serialNumber}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Company:</span>
//                         <span className="font-medium">{selectedItem.companyName}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Model:</span>
//                         <span className="font-medium">{selectedItem.model}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Type:</span>
//                         <span className="font-medium capitalize">{selectedItem.type.replace('_', ' ')}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Status:</span>
//                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                           selectedItem.status === INVENTORY_STATUS.IN_STOCK
//                             ? 'bg-green-100 text-green-800'
//                             : selectedItem.status === INVENTORY_STATUS.ASSIGNED
//                             ? 'bg-blue-100 text-blue-800'
//                             : selectedItem.status === INVENTORY_STATUS.INSTALLED
//                             ? 'bg-purple-100 text-purple-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}>
//                           {selectedItem.status.replace('_', ' ')}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   <div>
//                     <h4 className="font-medium text-gray-900 mb-3">Financial & Location</h4>
//                     <div className="space-y-2 text-sm">
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Cost:</span>
//                         <span className="font-medium">₹{selectedItem.cost?.toLocaleString() || 'N/A'}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Location:</span>
//                         <span className="font-medium">{selectedItem.location}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Purchase Date:</span>
//                         <span className="font-medium">{selectedItem.purchaseDate || 'N/A'}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Warranty Expiry:</span>
//                         <span className="font-medium">{selectedItem.warrantyExpiry || 'N/A'}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Added By:</span>
//                         <span className="font-medium">{selectedItem.addedByName}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Technical Specifications */}
//                 {selectedItem.specifications && (
//                   <div>
//                     <h4 className="font-medium text-gray-900 mb-3">Technical Specifications</h4>
//                     <div className="bg-gray-50 rounded-lg p-4">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                         {Object.entries(selectedItem.specifications).map(([key, value]) => (
//                           value && (
//                             <div key={key} className="flex justify-between">
//                               <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
//                               <span className="font-medium">{value}</span>
//                             </div>
//                           )
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Assignment History */}
//                 <div>
//                   <h4 className="font-medium text-gray-900 mb-3">Assignment History</h4>
//                   <div className="space-y-2">
//                     {selectedItem.assignedDate && (
//                       <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
//                         <div className="flex items-center space-x-2">
//                           <Clock className="w-4 h-4 text-blue-600" />
//                           <span className="text-sm text-blue-900">Assigned to Project</span>
//                         </div>
//                         <span className="text-sm text-blue-700">{selectedItem.assignedDate}</span>
//                       </div>
//                     )}
                    
//                     {selectedItem.installDate && (
//                       <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
//                         <div className="flex items-center space-x-2">
//                           <CheckCircle className="w-4 h-4 text-purple-600" />
//                           <span className="text-sm text-purple-900">Installed</span>
//                         </div>
//                         <span className="text-sm text-purple-700">{selectedItem.installDate}</span>
//                       </div>
//                     )}

//                     {selectedItem.addedAt && (
//                       <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//                         <div className="flex items-center space-x-2">
//                           <Package className="w-4 h-4 text-gray-600" />
//                           <span className="text-sm text-gray-900">Added to Inventory</span>
//                         </div>
//                         <span className="text-sm text-gray-700">{selectedItem.addedAt?.split('T')[0]}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Project Assignment Info */}
//                 {selectedItem.assignedTo && (
//                   <div>
//                     <h4 className="font-medium text-gray-900 mb-3">Current Assignment</h4>
//                     {(() => {
//                       const project = projects.find(p => p.serialNumbers?.includes(selectedItem.serialNumber));
//                       return project ? (
//                         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                           <div className="flex items-center justify-between mb-2">
//                             <h5 className="font-medium text-blue-900">{project.title}</h5>
//                             <span className="text-sm text-blue-700">Ref: {project.customerRefNumber}</span>
//                           </div>
//                           <div className="text-sm text-blue-800 space-y-1">
//                             <div className="flex items-center">
//                               <Users className="w-4 h-4 mr-2" />
//                               Customer: {project.customerName}
//                             </div>
//                             <div className="flex items-center">
//                               <MapPin className="w-4 h-4 mr-2" />
//                               Location: {project.location}
//                             </div>
//                             <div className="flex items-center">
//                               <Calendar className="w-4 h-4 mr-2" />
//                               Start Date: {project.startDate}
//                             </div>
//                           </div>
//                         </div>
//                       ) : (
//                         <div className="text-sm text-gray-600">Assignment details not available</div>
//                       );
//                     })()}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default InventoryManager;


import React, { useState } from 'react';
import { useApp } from '../../hooks/useApp.js'
import { INVENTORY_STATUS, INVENTORY_COMPANIES } from '../../types/index.js';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Building,
  Scan,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Users,
  Calendar,
  DollarSign,
  MapPin
} from 'lucide-react';

const InventoryManager = () => {
  const { 
    currentUser, 
    inventory, 
    projects, 
    addInventoryItem,     // ✅ Get this from context
    updateInventoryItem,  // ✅ Get this from context
    dispatch, 
    showToast 
  } = useApp();

  const [selectedCompany, setSelectedCompany] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showItemDetails, setShowItemDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newItem, setNewItem] = useState({
    company: '',
    serialNumber: '',
    type: 'solar_panel',
    model: '',
    specifications: {
      wattage: '',
      efficiency: '',
      dimensions: '',
      weight: ''
    },
    location: '',
    cost: '',
    warrantyExpiry: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  });
  const [assignmentData, setAssignmentData] = useState({
    projectId: '',
    serialNumbers: [],
    assignedTo: ''
  });

  // Only allow admin access
  if (currentUser?.role !== 'company') {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">Only administrators can manage inventory.</p>
      </div>
    );
  }

  const companyOptions = Object.entries(INVENTORY_COMPANIES).map(([key, value]) => ({
    value,
    label: value.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }));

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = !searchTerm || 
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCompany = !selectedCompany || item.company === selectedCompany;
    
    return matchesSearch && matchesStatus && matchesCompany;
  });

  const getInventoryStats = (company = null) => {
    const items = company ? inventory.filter(i => i.company === company) : inventory;
    return {
      total: items.length,
      inStock: items.filter(i => i.status === INVENTORY_STATUS.IN_STOCK).length,
      assigned: items.filter(i => i.status === INVENTORY_STATUS.ASSIGNED).length,
      installed: items.filter(i => i.status === INVENTORY_STATUS.INSTALLED).length,
      maintenance: items.filter(i => i.status === INVENTORY_STATUS.MAINTENANCE).length,
      totalValue: items.reduce((sum, i) => sum + (i.cost || 0), 0)
    };
  };

  // ✅ Updated handleAddItem to use addInventoryItem from context
  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!newItem.serialNumber || !newItem.company) {
      showToast('Serial number and company are required', 'error');
      return;
    }

    // Check for duplicate serial number
    const existingItem = inventory.find(i => i.serialNumber === newItem.serialNumber);
    if (existingItem) {
      showToast('Serial number already exists', 'error');
      return;
    }

    try {
      // Prepare the item data
      const itemData = {
        ...newItem,
        companyName: companyOptions.find(c => c.value === newItem.company)?.label || newItem.company,
        status: INVENTORY_STATUS.IN_STOCK,
        addedBy: currentUser.id,
        addedByName: currentUser.name,
        addedAt: new Date().toISOString()
      };

      // ✅ Use addInventoryItem from context instead of dispatch
      await addInventoryItem(itemData);

      // ✅ Reset form and close modal after successful addition
      setShowAddForm(false);
      setNewItem({
        company: '',
        serialNumber: '',
        type: 'solar_panel',
        model: '',
        specifications: {
          wattage: '',
          efficiency: '',
          dimensions: '',
          weight: ''
        },
        location: '',
        cost: '',
        warrantyExpiry: '',
        purchaseDate: new Date().toISOString().split('T')[0]
      });

    } catch (error) {
      console.error('Failed to add inventory item:', error);
      // Error toast is already shown by addInventoryItem function
    }
  };

  const handleAssignToProject = () => {
    if (!assignmentData.projectId || assignmentData.serialNumbers.length === 0) {
      showToast('Please select a project and at least one item', 'error');
      return;
    }

    const project = projects.find(p => p.id === assignmentData.projectId);
    if (!project) {
      showToast('Project not found', 'error');
      return;
    }

    // Update inventory status and assign to project
    assignmentData.serialNumbers.forEach(serialNumber => {
      dispatch({
        type: 'UPDATE_INVENTORY_STATUS',
        payload: {
          serialNumber,
          status: INVENTORY_STATUS.ASSIGNED,
          updates: {
            assignedTo: assignmentData.projectId,
            assignedDate: new Date().toISOString().split('T')[0],
            assignedBy: currentUser.id
          }
        }
      });
    });

    // Update project with assigned serial numbers
    dispatch({
      type: 'UPDATE_PROJECT',
      payload: {
        id: assignmentData.projectId,
        updates: {
          serialNumbers: [...(project.serialNumbers || []), ...assignmentData.serialNumbers]
        }
      }
    });

    showToast(`${assignmentData.serialNumbers.length} items assigned to ${project.title}`);
    setShowAssignModal(false);
    setAssignmentData({
      projectId: '',
      serialNumbers: [],
      assignedTo: ''
    });
  };

  const handleMarkAsInstalled = (serialNumber) => {
    dispatch({
      type: 'UPDATE_INVENTORY_STATUS',
      payload: {
        serialNumber,
        status: INVENTORY_STATUS.INSTALLED,
        updates: {
          installDate: new Date().toISOString().split('T')[0],
          installedBy: currentUser.id
        }
      }
    });
    showToast('Item marked as installed');
  };

  const CompanyCard = ({ company, stats }) => (
    <div 
      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
        selectedCompany === company.value 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      onClick={() => setSelectedCompany(selectedCompany === company.value ? '' : company.value)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Building className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium text-gray-900">{company.label}</h3>
        </div>
        <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">In Stock:</span>
          <span className="font-medium text-green-600">{stats.inStock}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Assigned:</span>
          <span className="font-medium text-blue-600">{stats.assigned}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Installed:</span>
          <span className="font-medium text-purple-600">{stats.installed}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Value:</span>
          <span className="font-medium text-gray-900">₹{stats.totalValue.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  const ItemRow = ({ item }) => {
    const project = projects.find(p => p.serialNumbers?.includes(item.serialNumber));
    
    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <Package className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-900">{item.serialNumber}</div>
              <div className="text-sm text-gray-500">{item.model}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{item.companyName}</div>
          <div className="text-sm text-gray-500 capitalize">{item.type.replace('_', ' ')}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            item.status === INVENTORY_STATUS.IN_STOCK
              ? 'bg-green-100 text-green-800'
              : item.status === INVENTORY_STATUS.ASSIGNED
              ? 'bg-blue-100 text-blue-800'
              : item.status === INVENTORY_STATUS.INSTALLED
              ? 'bg-purple-100 text-purple-800'
              : item.status === INVENTORY_STATUS.MAINTENANCE
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {item.status.replace('_', ' ')}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {project ? (
            <div>
              <div className="font-medium">{project.title}</div>
              <div className="text-gray-500">Ref: {project.customerRefNumber}</div>
            </div>
          ) : (
            <span className="text-gray-400">Unassigned</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ₹{item.cost?.toLocaleString() || 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {item.location}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedItem(item);
                setShowItemDetails(true);
              }}
              className="text-blue-600 hover:text-blue-900"
            >
              <Eye className="w-4 h-4" />
            </button>
            {item.status === INVENTORY_STATUS.IN_STOCK && (
              <button
                onClick={() => {
                  setSelectedItem(item);
                  setAssignmentData({
                    ...assignmentData,
                    serialNumbers: [item.serialNumber]
                  });
                  setShowAssignModal(true);
                }}
                className="text-green-600 hover:text-green-900"
              >
                <Users className="w-4 h-4" />
              </button>
            )}
            {item.status === INVENTORY_STATUS.ASSIGNED && (
              <button
                onClick={() => handleMarkAsInstalled(item.serialNumber)}
                className="text-purple-600 hover:text-purple-900"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600">Manage equipment by company and track serial numbers</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Inventory Item
        </button>
      </div>

      {/* Company Overview Cards */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory by Company</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companyOptions.map(company => {
            const stats = getInventoryStats(company.value);
            return (
              <CompanyCard key={company.value} company={company} stats={stats} />
            );
          })}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by serial number or model..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value={INVENTORY_STATUS.IN_STOCK}>In Stock</option>
              <option value={INVENTORY_STATUS.ASSIGNED}>Assigned</option>
              <option value={INVENTORY_STATUS.INSTALLED}>Installed</option>
              <option value={INVENTORY_STATUS.MAINTENANCE}>Maintenance</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAssignModal(true)}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              <Users className="w-4 h-4 mr-2" />
              Bulk Assign
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedCompany ? 
              `${companyOptions.find(c => c.value === selectedCompany)?.label} Inventory` : 
              'All Inventory Items'
            }
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredInventory.length} items • Total Value: ₹{getInventoryStats(selectedCompany).totalValue.toLocaleString()}
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company & Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map(item => (
                <ItemRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Add Inventory Item</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company *
                    </label>
                    <select
                      value={newItem.company}
                      onChange={(e) => setNewItem({...newItem, company: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Company</option>
                      {companyOptions.map(company => (
                        <option key={company.value} value={company.value}>
                          {company.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Serial Number *
                    </label>
                    <input
                      type="text"
                      value={newItem.serialNumber}
                      onChange={(e) => setNewItem({...newItem, serialNumber: e.target.value})}
                      placeholder="e.g., GKA96M560H20200902RX025"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Equipment Type *
                    </label>
                    <select
                      value={newItem.type}
                      onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="solar_panel">Solar Panel</option>
                      <option value="wind_turbine">Wind Turbine</option>
                      <option value="inverter">Inverter</option>
                      <option value="battery">Battery</option>
                      <option value="mounting_system">Mounting System</option>
                      <option value="monitoring_system">Monitoring System</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model *
                    </label>
                    <input
                      type="text"
                      value={newItem.model}
                      onChange={(e) => setNewItem({...newItem, model: e.target.value})}
                      placeholder="e.g., SolarMax 400W"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={newItem.location}
                      onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                      placeholder="e.g., Mumbai Warehouse"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost (₹)
                    </label>
                    <input
                      type="number"
                      value={newItem.cost}
                      onChange={(e) => setNewItem({...newItem, cost: e.target.value})}
                      placeholder="e.g., 15000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      value={newItem.purchaseDate}
                      onChange={(e) => setNewItem({...newItem, purchaseDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty Expiry
                    </label>
                    <input
                      type="date"
                      value={newItem.warrantyExpiry}
                      onChange={(e) => setNewItem({...newItem, warrantyExpiry: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Technical Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wattage/Capacity
                      </label>
                      <input
                        type="text"
                        value={newItem.specifications.wattage}
                        onChange={(e) => setNewItem({
                          ...newItem, 
                          specifications: {...newItem.specifications, wattage: e.target.value}
                        })}
                        placeholder="e.g., 400W"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Efficiency
                      </label>
                      <input
                        type="text"
                        value={newItem.specifications.efficiency}
                        onChange={(e) => setNewItem({
                          ...newItem, 
                          specifications: {...newItem.specifications, efficiency: e.target.value}
                        })}
                        placeholder="e.g., 21.2%"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dimensions
                      </label>
                      <input
                        type="text"
                        value={newItem.specifications.dimensions}
                        onChange={(e) => setNewItem({
                          ...newItem, 
                          specifications: {...newItem.specifications, dimensions: e.target.value}
                        })}
                        placeholder="e.g., 2008x1002x40mm"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight
                      </label>
                      <input
                        type="text"
                        value={newItem.specifications.weight}
                        onChange={(e) => setNewItem({
                          ...newItem, 
                          specifications: {...newItem.specifications, weight: e.target.value}
                        })}
                        placeholder="e.g., 24kg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Add to Inventory
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Assign Equipment to Project</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Project *
                </label>
                <select
                  value={assignmentData.projectId}
                  onChange={(e) => setAssignmentData({...assignmentData, projectId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose Project</option>
                  {projects.filter(p => p.status !== 'completed' && p.status !== 'cancelled').map(project => (
                    <option key={project.id} value={project.id}>
                      {project.title} (Ref: {project.customerRefNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Items to Assign
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                  {inventory.filter(item => item.status === INVENTORY_STATUS.IN_STOCK).map(item => (
                    <label key={item.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignmentData.serialNumbers.includes(item.serialNumber)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignmentData({
                              ...assignmentData,
                              serialNumbers: [...assignmentData.serialNumbers, item.serialNumber]
                            });
                          } else {
                            setAssignmentData({
                              ...assignmentData,
                              serialNumbers: assignmentData.serialNumbers.filter(s => s !== item.serialNumber)
                            });
                          }
                        }}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.serialNumber}</div>
                        <div className="text-sm text-gray-600">{item.companyName} - {item.model}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={handleAssignToProject}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                >
                  Assign Items ({assignmentData.serialNumbers.length})
                </button>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {showItemDetails && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Equipment Details</h3>
                <button
                  onClick={() => setShowItemDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Serial Number:</span>
                        <span className="font-mono font-medium">{selectedItem.serialNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Company:</span>
                        <span className="font-medium">{selectedItem.companyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Model:</span>
                        <span className="font-medium">{selectedItem.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium capitalize">{selectedItem.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedItem.status === INVENTORY_STATUS.IN_STOCK
                            ? 'bg-green-100 text-green-800'
                            : selectedItem.status === INVENTORY_STATUS.ASSIGNED
                            ? 'bg-blue-100 text-blue-800'
                            : selectedItem.status === INVENTORY_STATUS.INSTALLED
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedItem.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Financial & Location</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost:</span>
                        <span className="font-medium">₹{selectedItem.cost?.toLocaleString() || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{selectedItem.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Purchase Date:</span>
                        <span className="font-medium">{selectedItem.purchaseDate || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Warranty Expiry:</span>
                        <span className="font-medium">{selectedItem.warrantyExpiry || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Added By:</span>
                        <span className="font-medium">{selectedItem.addedByName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Specifications */}
                {selectedItem.specifications && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Technical Specifications</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {Object.entries(selectedItem.specifications).map(([key, value]) => (
                          value && (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className="font-medium">{value}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Assignment History */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Assignment History</h4>
                  <div className="space-y-2">
                    {selectedItem.assignedDate && (
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-900">Assigned to Project</span>
                        </div>
                        <span className="text-sm text-blue-700">{selectedItem.assignedDate}</span>
                      </div>
                    )}
                    
                    {selectedItem.installDate && (
                      <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-purple-900">Installed</span>
                        </div>
                        <span className="text-sm text-purple-700">{selectedItem.installDate}</span>
                      </div>
                    )}

                    {selectedItem.addedAt && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-900">Added to Inventory</span>
                        </div>
                        <span className="text-sm text-gray-700">{selectedItem.addedAt?.split('T')[0]}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Project Assignment Info */}
                {selectedItem.assignedTo && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Current Assignment</h4>
                    {(() => {
                      const project = projects.find(p => p.serialNumbers?.includes(selectedItem.serialNumber));
                      return project ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-blue-900">{project.title}</h5>
                            <span className="text-sm text-blue-700">Ref: {project.customerRefNumber}</span>
                          </div>
                          <div className="text-sm text-blue-800 space-y-1">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              Customer: {project.customerName}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              Location: {project.location}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Start Date: {project.startDate}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">Assignment details not available</div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
