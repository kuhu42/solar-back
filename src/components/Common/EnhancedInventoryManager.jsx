import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { INVENTORY_STATUS } from '../../types/index.js';
import { 
  Package, 
  Plus, 
  Building, 
  Search, 
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Download,
  Upload,
  Eye,
  TrendingUp
} from 'lucide-react';

const EnhancedInventoryManager = () => {
  const { 
    currentUser, 
    companies, 
    inventory,
    inventoryByCompany,
    createInventoryItem,
    updateInventoryStatus,
    getAvailableInventoryByCompany,
    showToast,
    isLiveMode
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [showItemDetails, setShowItemDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [availableInventory, setAvailableInventory] = useState([]);

  const [newItem, setNewItem] = useState({
    serial_number: '',
    model: '',
    type: 'solar_panel',
    company_id: '',
    company_name: '',
    quantity: 1,
    cost: 0,
    specifications: ''
  });

  const [newCompany, setNewCompany] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    if (selectedCompany) {
      loadAvailableInventory();
    }
  }, [selectedCompany]);

  const loadAvailableInventory = async () => {
    if (selectedCompany) {
      try {
        const available = await getAvailableInventoryByCompany(selectedCompany.id);
        setAvailableInventory(available);
      } catch (error) {
        console.error('Error loading available inventory:', error);
        showToast('Error loading inventory', 'error');
      }
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    
    if (!selectedCompany) {
      showToast('Please select a company first', 'error');
      return;
    }

    if (!newItem.serial_number || !newItem.model) {
      showToast('Serial number and model are required', 'error');
      return;
    }

    try {
      const itemData = {
        ...newItem,
        company_id: selectedCompany.id,
        company_name: selectedCompany.name,
        available_quantity: newItem.quantity
      };

      await createInventoryItem(itemData);
      showToast('Inventory item added successfully!');
      
      setNewItem({
        serial_number: '',
        model: '',
        type: 'solar_panel',
        company_id: '',
        company_name: '',
        quantity: 1,
        cost: 0,
        specifications: ''
      });
      setShowAddItem(false);
      loadAvailableInventory();
      
    } catch (error) {
      console.error('Error adding inventory item:', error);
      showToast('Error adding inventory item: ' + error.message, 'error');
    }
  };

  const handleAddCompany = async (e) => {
    e.preventDefault();
    try {
      if (isLiveMode) {
        // This would require implementing createCompany in dbService
        showToast('Company creation in live mode coming soon', 'info');
      } else {
        // Demo mode - add to local state
        const company = {
          id: `comp-${Date.now()}`,
          name: newCompany.name,
          description: newCompany.description,
          created_at: new Date().toISOString()
        };
        showToast('Company added successfully (demo mode)!');
      }
      
      setNewCompany({ name: '', description: '' });
      setShowAddCompany(false);
    } catch (error) {
      showToast('Error creating company: ' + error.message, 'error');
    }
  };

  const getCompanyStats = (companyName) => {
    const companyInventory = inventoryByCompany[companyName] || [];
    return {
      total: companyInventory.length,
      inStock: companyInventory.filter(item => item.status === INVENTORY_STATUS.IN_STOCK).length,
      assigned: companyInventory.filter(item => item.status === INVENTORY_STATUS.ASSIGNED).length,
      installed: companyInventory.filter(item => item.status === INVENTORY_STATUS.INSTALLED).length,
      totalValue: companyInventory.reduce((sum, item) => sum + (item.cost || 0), 0)
    };
  };

  const getAllStats = () => {
    return {
      total: inventory.length,
      inStock: inventory.filter(item => item.status === INVENTORY_STATUS.IN_STOCK).length,
      assigned: inventory.filter(item => item.status === INVENTORY_STATUS.ASSIGNED).length,
      installed: inventory.filter(item => item.status === INVENTORY_STATUS.INSTALLED).length,
      totalValue: inventory.reduce((sum, item) => sum + (item.cost || 0), 0),
      companies: companies.length
    };
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Check if user is admin
  const isAdmin = currentUser?.role === 'company' || currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-600">Only administrators can manage inventory.</p>
      </div>
    );
  }

  const allStats = getAllStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600">Manage equipment organized by company groups</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddCompany(true)}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <Building className="w-4 h-4 mr-2" />
            Add Company
          </button>
          <button
            onClick={() => {
              if (!selectedCompany) {
                showToast('Please select a company first', 'error');
                return;
              }
              setShowAddItem(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{allStats.total}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-green-600">{allStats.inStock}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-orange-600">{allStats.assigned}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Installed</p>
              <p className="text-2xl font-bold text-blue-600">{allStats.installed}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-lg font-bold text-purple-600">₹{allStats.totalValue.toLocaleString()}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('by-company')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'by-company'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              By Company
            </button>
            <button
              onClick={() => setActiveTab('all-items')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'all-items'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'reports'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Reports
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Inventory Overview</h3>
              
              {/* Company Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map((company) => {
                  const stats = getCompanyStats(company.name);
                  
                  return (
                    <div key={company.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{company.name}</h4>
                        <Building className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{company.description}</p>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-gray-50 rounded p-2">
                          <span className="text-gray-500">Total:</span>
                          <span className="font-medium ml-1">{stats.total}</span>
                        </div>
                        <div className="bg-green-50 rounded p-2">
                          <span className="text-gray-500">Available:</span>
                          <span className="font-medium ml-1 text-green-600">{stats.inStock}</span>
                        </div>
                        <div className="bg-orange-50 rounded p-2">
                          <span className="text-gray-500">Assigned:</span>
                          <span className="font-medium ml-1 text-orange-600">{stats.assigned}</span>
                        </div>
                        <div className="bg-blue-50 rounded p-2">
                          <span className="text-gray-500">Installed:</span>
                          <span className="font-medium ml-1 text-blue-600">{stats.installed}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Total Value:</span>
                          <span className="font-medium">₹{stats.totalValue.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedCompany(company);
                          setActiveTab('by-company');
                        }}
                        className="w-full mt-3 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Recent Activity */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  {inventory.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Package className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.model}</p>
                          <p className="text-xs text-gray-500">{item.company_name} • {item.serial_number}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === INVENTORY_STATUS.IN_STOCK ? 'bg-green-100 text-green-800' :
                        item.status === INVENTORY_STATUS.ASSIGNED ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'by-company' && (
            <div className="space-y-6">
              {/* Company Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Company</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companies.map((company) => {
                    const stats = getCompanyStats(company.name);
                    const isSelected = selectedCompany?.id === company.id;
                    
                    return (
                      <div
                        key={company.id}
                        onClick={() => setSelectedCompany(company)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{company.name}</h4>
                          {isSelected && <CheckCircle className="w-5 h-5 text-blue-600" />}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{company.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Total:</span>
                            <span className="font-medium ml-1">{stats.total}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Available:</span>
                            <span className="font-medium ml-1 text-green-600">{stats.inStock}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Company Inventory */}
              {selectedCompany && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedCompany.name} Inventory
                    </h3>
                    <button
                      onClick={() => setShowAddItem(true)}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-4">
                    {inventoryByCompany[selectedCompany.name]?.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-gray-900">{item.model}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.status === INVENTORY_STATUS.IN_STOCK
                                  ? 'bg-green-100 text-green-800'
                                  : item.status === INVENTORY_STATUS.ASSIGNED
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {item.status.replace('_', ' ')}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Serial Number:</span>
                                <p className="font-mono text-xs mt-1">{item.serial_number}</p>
                              </div>
                              <div>
                                <span className="font-medium">Type:</span>
                                <p className="mt-1 capitalize">{item.type?.replace('_', ' ')}</p>
                              </div>
                              <div>
                                <span className="font-medium">Available Quantity:</span>
                                <p className="mt-1">{item.available_quantity || 0}</p>
                              </div>
                            </div>

                            {item.specifications && (
                              <div className="mt-3">
                                <span className="text-sm font-medium text-gray-700">Specifications:</span>
                                <p className="text-sm text-gray-600 mt-1">{item.specifications}</p>
                              </div>
                            )}

                            {item.assigned_to_project && (
                              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <p className="text-sm font-medium text-orange-900">
                                  Assigned to Project: {item.assigned_to_project}
                                </p>
                                {item.assigned_date && (
                                  <p className="text-xs text-orange-700 mt-1">
                                    Assigned on: {new Date(item.assigned_date).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            )}

                            {item.status === INVENTORY_STATUS.INSTALLED && (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm font-medium text-blue-900">
                                  Installed by: {item.installed_by}
                                </p>
                                {item.install_date && (
                                  <p className="text-xs text-blue-700 mt-1">
                                    Install date: {new Date(item.install_date).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {item.cost && (
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">₹{item.cost.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">Cost</p>
                              </div>
                            )}
                            <button
                              onClick={() => setShowItemDetails(item)}
                              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {(!inventoryByCompany[selectedCompany.name] || inventoryByCompany[selectedCompany.name].length === 0) && (
                      <div className="text-center py-8">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No Inventory Items</h4>
                        <p className="text-gray-600 mb-4">Start by adding your first inventory item for {selectedCompany.name}</p>
                        <button
                          onClick={() => setShowAddItem(true)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Item
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'all-items' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">All Inventory Items</h3>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="in_stock">In Stock</option>
                    <option value="assigned">Assigned</option>
                    <option value="installed">Installed</option>
                  </select>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInventory.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.model}</div>
                            <div className="text-xs text-gray-500 font-mono">{item.serial_number}</div>
                            <div className="text-xs text-gray-500 capitalize">{item.type?.replace('_', ' ')}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.company_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.status === INVENTORY_STATUS.IN_STOCK
                              ? 'bg-green-100 text-green-800'
                              : item.status === INVENTORY_STATUS.ASSIGNED
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.available_quantity || 0} / {item.quantity || 1}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.cost ? `₹${item.cost.toLocaleString()}` : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setShowItemDetails(item)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredInventory.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Items Found</h4>
                    <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Inventory Reports</h3>
              
              {/* Report Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Status Distribution</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">In Stock</span>
                      <span className="text-sm font-medium text-green-600">{allStats.inStock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Assigned</span>
                      <span className="text-sm font-medium text-orange-600">{allStats.assigned}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Installed</span>
                      <span className="text-sm font-medium text-blue-600">{allStats.installed}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Value Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Value</span>
                      <span className="text-sm font-medium">₹{allStats.totalValue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Average per Item</span>
                      <span className="text-sm font-medium">
                        ₹{allStats.total > 0 ? Math.round(allStats.totalValue / allStats.total).toLocaleString() : 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Companies</span>
                      <span className="text-sm font-medium">{allStats.companies}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Quick Actions</h4>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </button>
                    <button className="w-full flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Import Items
                    </button>
                    <button className="w-full flex items-center justify-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Analytics
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Recent Inventory Changes</h4>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="space-y-1">
                    {inventory.filter(item => item.assigned_date || item.install_date)
                      .sort((a, b) => new Date(b.assigned_date || b.install_date) - new Date(a.assigned_date || a.install_date))
                      .slice(0, 10)
                      .map((item, index) => (
                        <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            <Package className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.model}</p>
                              <p className="text-xs text-gray-500">{item.serial_number} • {item.company_name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">
                              {item.status === 'installed' ? 'Installed' : 'Assigned'} on{' '}
                              {new Date(item.install_date || item.assigned_date).toLocaleDateString()}
                            </p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === INVENTORY_STATUS.INSTALLED ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {item.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Inventory Item to {selectedCompany?.name}
            </h3>
            
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serial Number *
                  </label>
                  <input
                    type="text"
                    value={newItem.serial_number}
                    onChange={(e) => setNewItem({...newItem, serial_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., TSP001234567890"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model *
                  </label>
                  <input
                    type="text"
                    value={newItem.model}
                    onChange={(e) => setNewItem({...newItem, model: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Tata Solar 540W Mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={newItem.type}
                    onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="solar_panel">Solar Panel</option>
                    <option value="inverter">Inverter</option>
                    <option value="battery">Battery</option>
                    <option value="mounting_structure">Mounting Structure</option>
                    <option value="cable">Cable</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost per Unit (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.cost}
                  onChange={(e) => setNewItem({...newItem, cost: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specifications
                </label>
                <textarea
                  value={newItem.specifications}
                  onChange={(e) => setNewItem({...newItem, specifications: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter technical specifications, warranty info, etc."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Important:</p>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      <li>Each serial number must be unique across all inventory</li>
                      <li>Quantity represents individual units with the same serial number</li>
                      <li>Items will be available for project assignment once added</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Add Inventory Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Company Modal */}
      {showAddCompany && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Company</h3>
            
            <form onSubmit={handleAddCompany} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Adani Solar"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCompany.description}
                  onChange={(e) => setNewCompany({...newCompany, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of the company and their equipment"
                />
              </div>
              
              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Add Company
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCompany(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Details Modal */}
      {showItemDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Details</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model</label>
                  <p className="text-sm text-gray-900 mt-1">{showItemDetails.model}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Serial Number</label>
                  <p className="text-sm text-gray-900 mt-1 font-mono">{showItemDetails.serial_number}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <p className="text-sm text-gray-900 mt-1">{showItemDetails.company_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <p className="text-sm text-gray-900 mt-1 capitalize">{showItemDetails.type?.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    showItemDetails.status === INVENTORY_STATUS.IN_STOCK
                      ? 'bg-green-100 text-green-800'
                      : showItemDetails.status === INVENTORY_STATUS.ASSIGNED
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {showItemDetails.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <p className="text-sm text-gray-900 mt-1">{showItemDetails.quantity || 1}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Available</label>
                  <p className="text-sm text-gray-900 mt-1">{showItemDetails.available_quantity || 0}</p>
                </div>
              </div>

              {showItemDetails.cost && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cost</label>
                  <p className="text-sm text-gray-900 mt-1">₹{showItemDetails.cost.toLocaleString()}</p>
                </div>
              )}

              {showItemDetails.specifications && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specifications</label>
                  <p className="text-sm text-gray-900 mt-1">{showItemDetails.specifications}</p>
                </div>
              )}

              {showItemDetails.assigned_to_project && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-900">Assignment Details</h4>
                  <p className="text-sm text-orange-800 mt-1">Project: {showItemDetails.assigned_to_project}</p>
                  {showItemDetails.assigned_date && (
                    <p className="text-sm text-orange-700">
                      Assigned: {new Date(showItemDetails.assigned_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {showItemDetails.status === INVENTORY_STATUS.INSTALLED && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900">Installation Details</h4>
                  <p className="text-sm text-blue-800 mt-1">Installed by: {showItemDetails.installed_by}</p>
                  {showItemDetails.install_date && (
                    <p className="text-sm text-blue-700">
                      Install Date: {new Date(showItemDetails.install_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowItemDetails(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedInventoryManager;