import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { restaurants as staticRestaurants } from '@/data/restaurants';

interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  user_type: 'customer' | 'rider';
  is_approved: boolean;
  approval_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface DBRestaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  category: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface DBMenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  is_available: boolean;
}

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'riders' | 'customers' | 'create' | 'restaurants' | 'items'>('pending');
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<DBRestaurant[]>([]);
  const [menuItems, setMenuItems] = useState<DBMenuItem[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemSearchQuery, setItemSearchQuery] = useState('');

  // Create rider form
  const [newRider, setNewRider] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  });

  // Create restaurant form
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    image: '',
    rating: 4.5,
    category: '',
    description: '',
  });

  // Create menu item form
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    price: 0,
    category: '',
    description: '',
  });

  // Edit states
  const [editingRestaurant, setEditingRestaurant] = useState<DBRestaurant | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<DBMenuItem | null>(null);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
  };

  const fetchRestaurants = async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching restaurants:', error);
      if (error.message.includes('does not exist') || error.code === '42P01') {
        setDbError('restaurants');
      }
      return;
    }
    
    if (data) {
      setRestaurants(data);
      setDbError(null);
    }
  };

  const fetchMenuItems = async (restaurantId: string) => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching menu items:', error);
      if (error.message.includes('does not exist') || error.code === '42P01') {
        setDbError('menu_items');
      }
      return;
    }
    
    if (data) {
      setMenuItems(data);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchUsers(), fetchRestaurants()]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchMenuItems(selectedRestaurant);
    } else {
      setMenuItems([]);
    }
  }, [selectedRestaurant]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    const { error } = await supabase
      .from('users')
      .update({ is_approved: true, approval_status: 'approved' })
      .eq('id', userId);

    if (!error) {
      showMessage('success', 'Rider approved successfully!');
      fetchUsers();
    } else {
      showMessage('error', 'Failed to approve rider');
    }
    setActionLoading(null);
  };

  const handleReject = async (userId: string) => {
    setActionLoading(userId);
    const { error } = await supabase
      .from('users')
      .update({ is_approved: false, approval_status: 'rejected' })
      .eq('id', userId);

    if (!error) {
      showMessage('success', 'Rider rejected');
      fetchUsers();
    } else {
      showMessage('error', 'Failed to reject rider');
    }
    setActionLoading(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    setActionLoading(userId);
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (!error) {
      showMessage('success', 'User deleted');
      fetchUsers();
    } else {
      showMessage('error', 'Failed to delete user');
    }
    setActionLoading(null);
  };

  const handleCreateRider = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('create');

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', newRider.email)
      .single();

    if (existing) {
      showMessage('error', 'Email already registered');
      setActionLoading(null);
      return;
    }

    const { error } = await supabase
      .from('users')
      .insert([{
        email: newRider.email,
        password_hash: newRider.password,
        full_name: newRider.full_name,
        phone: newRider.phone,
        user_type: 'rider',
        is_verified: true,
        is_approved: true,
        is_admin: false,
        approval_status: 'approved',
        location: '',
        created_at: new Date().toISOString(),
      }]);

    if (!error) {
      showMessage('success', 'Rider created successfully!');
      setNewRider({ email: '', password: '', full_name: '', phone: '' });
      fetchUsers();
    } else {
      showMessage('error', error.message);
    }
    setActionLoading(null);
  };

  // Restaurant CRUD
  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('create-restaurant');

    const { error } = await supabase
      .from('restaurants')
      .insert([{
        name: newRestaurant.name,
        image: newRestaurant.image,
        rating: newRestaurant.rating,
        category: newRestaurant.category,
        description: newRestaurant.description,
        is_active: true,
      }]);

    if (!error) {
      showMessage('success', 'Restaurant created successfully!');
      setNewRestaurant({ name: '', image: '', rating: 4.5, category: '', description: '' });
      fetchRestaurants();
    } else {
      showMessage('error', error.message);
    }
    setActionLoading(null);
  };

  const handleUpdateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRestaurant) return;
    setActionLoading('update-restaurant');

    const { error } = await supabase
      .from('restaurants')
      .update({
        name: editingRestaurant.name,
        image: editingRestaurant.image,
        rating: editingRestaurant.rating,
        category: editingRestaurant.category,
        description: editingRestaurant.description,
      })
      .eq('id', editingRestaurant.id);

    if (!error) {
      showMessage('success', 'Restaurant updated!');
      setEditingRestaurant(null);
      fetchRestaurants();
    } else {
      showMessage('error', error.message);
    }
    setActionLoading(null);
  };

  const handleDeleteRestaurant = async (id: string) => {
    if (!confirm('Delete this restaurant and all its menu items?')) return;
    setActionLoading(id);

    // First delete all menu items for this restaurant
    await supabase.from('menu_items').delete().eq('restaurant_id', id);

    const { error } = await supabase
      .from('restaurants')
      .delete()
      .eq('id', id);

    if (!error) {
      showMessage('success', 'Restaurant deleted');
      fetchRestaurants();
    } else {
      showMessage('error', error.message);
    }
    setActionLoading(null);
  };

  // Menu Item CRUD
  const handleCreateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant) return;
    setActionLoading('create-item');

    const { error } = await supabase
      .from('menu_items')
      .insert([{
        restaurant_id: selectedRestaurant,
        name: newMenuItem.name,
        price: newMenuItem.price,
        category: newMenuItem.category,
        description: newMenuItem.description || '',
        is_available: true,
      }]);

    if (!error) {
      showMessage('success', 'Menu item added!');
      setNewMenuItem({ name: '', price: 0, category: '', description: '' });
      fetchMenuItems(selectedRestaurant);
    } else {
      showMessage('error', error.message);
    }
    setActionLoading(null);
  };

  const handleUpdateMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMenuItem) return;
    setActionLoading('update-item');

    const { error } = await supabase
      .from('menu_items')
      .update({
        name: editingMenuItem.name,
        price: editingMenuItem.price,
        category: editingMenuItem.category,
        description: editingMenuItem.description,
      })
      .eq('id', editingMenuItem.id);

    if (!error) {
      showMessage('success', 'Item updated!');
      setEditingMenuItem(null);
      if (selectedRestaurant) fetchMenuItems(selectedRestaurant);
    } else {
      showMessage('error', error.message);
    }
    setActionLoading(null);
  };

  const handleDeleteMenuItem = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    setActionLoading(id);

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (!error) {
      showMessage('success', 'Item deleted');
      if (selectedRestaurant) fetchMenuItems(selectedRestaurant);
    } else {
      showMessage('error', error.message);
    }
    setActionLoading(null);
  };

  // Import static data to database
  const handleImportStaticData = async () => {
    if (!confirm('This will import all static restaurant and menu data to the database. Continue?')) return;
    
    setActionLoading('import');
    setImportProgress('Starting import...');

    try {
      for (let i = 0; i < staticRestaurants.length; i++) {
        const restaurant = staticRestaurants[i];
        setImportProgress(`Importing ${restaurant.name} (${i + 1}/${staticRestaurants.length})...`);

        // Check if restaurant already exists
        const { data: existing } = await supabase
          .from('restaurants')
          .select('id')
          .eq('name', restaurant.name)
          .single();

        let restaurantId: string;

        if (existing) {
          restaurantId = existing.id;
        } else {
          // Insert restaurant
          const { data: newRest, error: restError } = await supabase
            .from('restaurants')
            .insert([{
              name: restaurant.name,
              image: restaurant.image,
              rating: restaurant.rating,
              category: restaurant.category,
              description: restaurant.description,
              is_active: true,
            }])
            .select()
            .single();

          if (restError) {
            console.error('Error inserting restaurant:', restError);
            continue;
          }
          restaurantId = newRest.id;
        }

        // Import menu items
        const menuItemsToInsert = restaurant.menu.map(item => ({
          restaurant_id: restaurantId,
          name: item.name,
          price: item.price,
          category: item.category || 'Other',
          description: '',
          is_available: true,
        }));

        // Delete existing menu items for this restaurant first
        await supabase.from('menu_items').delete().eq('restaurant_id', restaurantId);

        // Insert new menu items in batches
        const batchSize = 50;
        for (let j = 0; j < menuItemsToInsert.length; j += batchSize) {
          const batch = menuItemsToInsert.slice(j, j + batchSize);
          const { error: itemError } = await supabase
            .from('menu_items')
            .insert(batch);

          if (itemError) {
            console.error('Error inserting menu items:', itemError);
          }
        }
      }

      setImportProgress(null);
      showMessage('success', 'All data imported successfully!');
      fetchRestaurants();
    } catch (error) {
      console.error('Import error:', error);
      showMessage('error', 'Import failed. Check console for details.');
    }

    setActionLoading(null);
    setImportProgress(null);
  };

  const pendingRiders = users.filter(u => u.user_type === 'rider' && u.approval_status === 'pending');
  const allRiders = users.filter(u => u.user_type === 'rider');
  const allCustomers = users.filter(u => u.user_type === 'customer');

  // Filter restaurants by search
  const filteredRestaurants = restaurants.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter menu items by search
  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(itemSearchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'pending', label: 'Pending', badge: pendingRiders.length },
    { id: 'riders', label: 'Riders' },
    { id: 'customers', label: 'Customers' },
    { id: 'create', label: '+ Rider' },
    { id: 'restaurants', label: 'Restaurants' },
    { id: 'items', label: 'Menu Items' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-sm text-purple-200">Manage users, restaurants & menu</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
              <p className="text-xl font-bold">{pendingRiders.length}</p>
              <p className="text-[10px] text-purple-200">Pending</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
              <p className="text-xl font-bold">{allRiders.length}</p>
              <p className="text-[10px] text-purple-200">Riders</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
              <p className="text-xl font-bold">{allCustomers.length}</p>
              <p className="text-[10px] text-purple-200">Customers</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
              <p className="text-xl font-bold">{restaurants.length}</p>
              <p className="text-[10px] text-purple-200">Restaurants</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mx-4 mt-4 p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Import Progress */}
      {importProgress && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-blue-100 text-blue-800">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            {importProgress}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm overflow-x-auto">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 text-center text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-purple-600 bg-purple-50 border-b-2 border-purple-600'
                  : 'text-gray-500'
              }`}
            >
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px]">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading...</p>
          </div>
        ) : (
          <>
            {/* Pending Riders */}
            {activeTab === 'pending' && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">Pending Rider Applications</h3>
                {pendingRiders.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-xl">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 font-medium">No pending applications</p>
                  </div>
                ) : (
                  pendingRiders.map((rider) => (
                    <div key={rider.id} className="bg-white rounded-xl shadow-sm p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{rider.full_name}</p>
                            <p className="text-sm text-gray-500">{rider.email}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Pending
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(rider.id)}
                          disabled={actionLoading === rider.id}
                          className="flex-1 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(rider.id)}
                          disabled={actionLoading === rider.id}
                          className="flex-1 py-2 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* All Riders */}
            {activeTab === 'riders' && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">All Riders ({allRiders.length})</h3>
                {allRiders.map((rider) => (
                  <div key={rider.id} className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{rider.full_name}</p>
                        <p className="text-xs text-gray-500">{rider.email}</p>
                        <p className="text-xs text-gray-500">{rider.phone}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rider.approval_status === 'approved' ? 'bg-green-100 text-green-800' : 
                          rider.approval_status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {rider.approval_status}
                        </span>
                        <div className="mt-2">
                          <button
                            onClick={() => handleDeleteUser(rider.id)}
                            className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* All Customers */}
            {activeTab === 'customers' && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">All Customers ({allCustomers.length})</h3>
                {allCustomers.map((customer) => (
                  <div key={customer.id} className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{customer.full_name}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                        <p className="text-xs text-gray-500">{customer.phone}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteUser(customer.id)}
                        className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Create Rider */}
            {activeTab === 'create' && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-bold text-gray-800 mb-4">Create New Rider</h3>
                <form onSubmit={handleCreateRider} className="space-y-4">
                  <input
                    type="text"
                    value={newRider.full_name}
                    onChange={(e) => setNewRider({ ...newRider, full_name: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-lg"
                    placeholder="Full Name"
                    required
                  />
                  <input
                    type="email"
                    value={newRider.email}
                    onChange={(e) => setNewRider({ ...newRider, email: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-lg"
                    placeholder="Email"
                    required
                  />
                  <input
                    type="tel"
                    value={newRider.phone}
                    onChange={(e) => setNewRider({ ...newRider, phone: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-lg"
                    placeholder="Phone"
                    required
                  />
                  <input
                    type="password"
                    value={newRider.password}
                    onChange={(e) => setNewRider({ ...newRider, password: e.target.value })}
                    className="w-full px-3 py-2.5 border rounded-lg"
                    placeholder="Password"
                    required
                    minLength={6}
                  />
                  <button
                    type="submit"
                    disabled={actionLoading === 'create'}
                    className="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg disabled:opacity-50"
                  >
                    {actionLoading === 'create' ? 'Creating...' : 'Create Rider'}
                  </button>
                </form>
              </div>
            )}

            {/* Restaurants Management */}
            {activeTab === 'restaurants' && (
              <div className="space-y-4">
                {/* Import Button */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 text-white">
                  <h3 className="font-bold mb-2">Import Static Data</h3>
                  <p className="text-sm text-blue-100 mb-3">
                    Import all {staticRestaurants.length} restaurants and their menu items from the app's static data to the database.
                  </p>
                  <button
                    onClick={handleImportStaticData}
                    disabled={actionLoading === 'import'}
                    className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 disabled:opacity-50"
                  >
                    {actionLoading === 'import' ? 'Importing...' : 'Import All Data'}
                  </button>
                </div>

                {/* Add Restaurant Form */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <h3 className="font-bold text-gray-800 mb-4">
                    {editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
                  </h3>
                  <form onSubmit={editingRestaurant ? handleUpdateRestaurant : handleCreateRestaurant} className="space-y-3">
                    <input
                      type="text"
                      value={editingRestaurant?.name || newRestaurant.name}
                      onChange={(e) => editingRestaurant 
                        ? setEditingRestaurant({ ...editingRestaurant, name: e.target.value })
                        : setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="Restaurant Name"
                      required
                    />
                    <input
                      type="text"
                      value={editingRestaurant?.image || newRestaurant.image}
                      onChange={(e) => editingRestaurant 
                        ? setEditingRestaurant({ ...editingRestaurant, image: e.target.value })
                        : setNewRestaurant({ ...newRestaurant, image: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="Image URL"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editingRestaurant?.category || newRestaurant.category}
                        onChange={(e) => editingRestaurant 
                          ? setEditingRestaurant({ ...editingRestaurant, category: e.target.value })
                          : setNewRestaurant({ ...newRestaurant, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        placeholder="Category"
                        required
                      />
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={editingRestaurant?.rating || newRestaurant.rating}
                        onChange={(e) => editingRestaurant 
                          ? setEditingRestaurant({ ...editingRestaurant, rating: parseFloat(e.target.value) })
                          : setNewRestaurant({ ...newRestaurant, rating: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        placeholder="Rating"
                      />
                    </div>
                    <textarea
                      value={editingRestaurant?.description || newRestaurant.description}
                      onChange={(e) => editingRestaurant 
                        ? setEditingRestaurant({ ...editingRestaurant, description: e.target.value })
                        : setNewRestaurant({ ...newRestaurant, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="Description"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={actionLoading?.includes('restaurant')}
                        className="flex-1 py-2 bg-purple-600 text-white font-semibold rounded-lg disabled:opacity-50"
                      >
                        {editingRestaurant ? 'Update' : 'Add Restaurant'}
                      </button>
                      {editingRestaurant && (
                        <button
                          type="button"
                          onClick={() => setEditingRestaurant(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search restaurants..."
                    className="w-full px-4 py-2 pl-10 border rounded-lg"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Restaurant List */}
                <h3 className="font-semibold text-gray-700">All Restaurants ({filteredRestaurants.length})</h3>
                {filteredRestaurants.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-xl">
                    <p className="text-gray-500">No restaurants found. Import static data or add a new restaurant.</p>
                  </div>
                ) : (
                  filteredRestaurants.map((restaurant) => (
                    <div key={restaurant.id} className="bg-white rounded-xl shadow-sm p-4">
                      <div className="flex gap-3">
                        {restaurant.image && (
                          <img src={restaurant.image} alt={restaurant.name} className="w-16 h-16 rounded-lg object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{restaurant.name}</p>
                          <p className="text-xs text-gray-500">{restaurant.category}</p>
                          <p className="text-xs text-gray-400 truncate">{restaurant.description}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs text-gray-600">{restaurant.rating}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => setEditingRestaurant(restaurant)}
                            className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRestaurant(restaurant.id)}
                            disabled={actionLoading === restaurant.id}
                            className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Menu Items Management */}
            {activeTab === 'items' && (
              <div className="space-y-4">
                {/* Restaurant Selector */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Restaurant</label>
                  <select
                    value={selectedRestaurant || ''}
                    onChange={(e) => setSelectedRestaurant(e.target.value || null)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">-- Select a restaurant --</option>
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {restaurants.length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-yellow-800 text-sm">
                      No restaurants in database. Go to the Restaurants tab and import static data or add restaurants first.
                    </p>
                  </div>
                )}

                {selectedRestaurant && (
                  <>
                    {/* Add Menu Item Form */}
                    <div className="bg-white rounded-xl shadow-sm p-4">
                      <h3 className="font-bold text-gray-800 mb-4">
                        {editingMenuItem ? 'Edit Menu Item' : 'Add Menu Item'}
                      </h3>
                      <form onSubmit={editingMenuItem ? handleUpdateMenuItem : handleCreateMenuItem} className="space-y-3">
                        <input
                          type="text"
                          value={editingMenuItem?.name || newMenuItem.name}
                          onChange={(e) => editingMenuItem 
                            ? setEditingMenuItem({ ...editingMenuItem, name: e.target.value })
                            : setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          placeholder="Item Name"
                          required
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={editingMenuItem?.price || newMenuItem.price}
                            onChange={(e) => editingMenuItem 
                              ? setEditingMenuItem({ ...editingMenuItem, price: parseFloat(e.target.value) })
                              : setNewMenuItem({ ...newMenuItem, price: parseFloat(e.target.value) })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                            placeholder="Price (KSH)"
                            required
                          />
                          <input
                            type="text"
                            value={editingMenuItem?.category || newMenuItem.category}
                            onChange={(e) => editingMenuItem 
                              ? setEditingMenuItem({ ...editingMenuItem, category: e.target.value })
                              : setNewMenuItem({ ...newMenuItem, category: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                            placeholder="Category"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={actionLoading?.includes('item')}
                            className="flex-1 py-2 bg-purple-600 text-white font-semibold rounded-lg disabled:opacity-50"
                          >
                            {editingMenuItem ? 'Update' : 'Add Item'}
                          </button>
                          {editingMenuItem && (
                            <button
                              type="button"
                              onClick={() => setEditingMenuItem(null)}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    </div>

                    {/* Search Items */}
                    <div className="relative">
                      <input
                        type="text"
                        value={itemSearchQuery}
                        onChange={(e) => setItemSearchQuery(e.target.value)}
                        placeholder="Search menu items..."
                        className="w-full px-4 py-2 pl-10 border rounded-lg"
                      />
                      <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>

                    {/* Menu Items List */}
                    <h3 className="font-semibold text-gray-700">Menu Items ({filteredMenuItems.length})</h3>
                    {filteredMenuItems.length === 0 ? (
                      <div className="text-center py-8 bg-white rounded-xl">
                        <p className="text-gray-500">No menu items yet. Add items above.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                        {filteredMenuItems.map((item) => (
                          <div key={item.id} className="bg-white rounded-lg shadow-sm p-3 flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.category} • KSH {item.price}</p>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={() => setEditingMenuItem(item)}
                                className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMenuItem(item.id)}
                                disabled={actionLoading === item.id}
                                className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
