import React, { useState, useEffect } from 'react';
import { vehiclesAPI } from '../api/vehicles';
import { toast } from 'react-toastify';

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', description: '', image_url: '' });
  const [editId, setEditId] = useState(null);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehiclesAPI.getAllVehicles();
      setVehicles(res.data.vehicles || res.data); // handle both { vehicles: [...] } and [...] formats
      setError(null);
    } catch (err) {
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setEditId(null);
    setForm({ name: '', type: '', description: '', image_url: '' });
    setShowForm(true);
  };

  const handleEdit = (vehicle) => {
    setEditId(vehicle.id);
    setForm(vehicle);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this vehicle?')) {
      try {
        await vehiclesAPI.deleteVehicle(id);
        fetchVehicles();
        toast.success('Vehicle deleted');
      } catch {
        toast.error('Failed to delete vehicle');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await vehiclesAPI.updateVehicle(editId, form);
        toast.success('Vehicle updated');
      } else {
        await vehiclesAPI.createVehicle(form);
        toast.success('Vehicle added');
      }
      setShowForm(false);
      setForm({ name: '', type: '', description: '', image_url: '' });
      setEditId(null);
      fetchVehicles();
    } catch {
      toast.error('Failed to save vehicle');
    }
  };

  if (loading) return <div>Loading vehicles...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <button onClick={handleAdd} style={{ background: '#ff5e5b', color: '#fff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: 4, marginBottom: 20, fontWeight: 600 }}>Add Vehicle</button>
      <div style={{ display: 'grid', gap: 20 }}>
        {vehicles.map(vehicle => (
          <div key={vehicle.id} style={{ display: 'flex', alignItems: 'center', background: '#fff6f6', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <img src={vehicle.image_url || 'https://via.placeholder.com/100x70?text=Vehicle'} alt={vehicle.name} style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 6, marginRight: 20 }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0 }}>{vehicle.name}</h3>
              <div style={{ color: '#888', fontSize: 14 }}>{vehicle.type}</div>
              <div style={{ color: '#555', marginTop: 6 }}>{vehicle.description}</div>
            </div>
            <button onClick={() => handleEdit(vehicle)} style={{ marginRight: 10, background: '#ffd6d6', color: '#ff5e5b', border: 'none', borderRadius: 4, padding: '0.4rem 1rem', fontWeight: 500 }}>Edit</button>
            <button onClick={() => handleDelete(vehicle.id)} style={{ background: '#ff5e5b', color: '#fff', border: 'none', borderRadius: 4, padding: '0.4rem 1rem', fontWeight: 500 }}>Delete</button>
          </div>
        ))}
      </div>
      {showForm && (
        <div style={{ marginTop: 30, background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h3>{editId ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12, maxWidth: 400 }}>
            <input name="name" value={form.name} onChange={handleInputChange} placeholder="Vehicle Name" required style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
            <input name="type" value={form.type} onChange={handleInputChange} placeholder="Type (Car, Bus, etc.)" required style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
            <input name="image_url" value={form.image_url} onChange={handleInputChange} placeholder="Image URL (optional)" style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
            <textarea name="description" value={form.description} onChange={handleInputChange} placeholder="Description" rows={3} style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
            <div>
              <button type="submit" style={{ background: '#ff5e5b', color: '#fff', border: 'none', borderRadius: 4, padding: '0.5rem 1.5rem', fontWeight: 600, marginRight: 10 }}>{editId ? 'Update' : 'Add'}</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 4, padding: '0.5rem 1.5rem', fontWeight: 500 }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement; 