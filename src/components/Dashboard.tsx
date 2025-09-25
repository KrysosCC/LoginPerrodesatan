import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import AnnouncementCard from './AnnouncementCard';
import AnnouncementForm from './AnnouncementForm';

type Announcement = Database['public']['Tables']['announcements']['Row'];

// Mock announcements for testing
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Reunión Mensual de la Directiva',
    description: 'Se convoca a todos los miembros de la directiva a la reunión mensual que se realizará el próximo viernes 15 de marzo a las 18:00 horas en el salón principal.\n\nTemas a tratar:\n- Revisión del presupuesto anual\n- Planificación de eventos\n- Propuestas de mejoras',
    author_id: 'test-user-id',
    author_email: 'gonzalo.ivjn@gmail.com',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    title: 'Actualización de Documentos Oficiales',
    description: 'Se informa que se han actualizado los documentos oficiales del círculo. Todos los miembros deben revisar los nuevos estatutos y reglamentos internos.\n\nLos documentos están disponibles en la secretaría.',
    author_id: 'admin-user',
    author_email: 'admin@circuloemeriten.org',
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  }
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    // For test user, use mock data
    if (user?.email === 'gonzalo.ivjn@gmail.com') {
      setAnnouncements(mockAnnouncements);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (err: any) {
      // For demo purposes, show mock data even if Supabase fails
      setAnnouncements(mockAnnouncements);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (title: string, description: string) => {
    if (!user) return;

    // For test user, simulate adding to mock data
    if (user.email === 'gonzalo.ivjn@gmail.com') {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        title,
        description,
        author_id: user.id,
        author_email: user.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (editingAnnouncement) {
        setAnnouncements(prev => 
          prev.map(ann => 
            ann.id === editingAnnouncement.id 
              ? { ...ann, title, description, updated_at: new Date().toISOString() }
              : ann
          )
        );
      } else {
        setAnnouncements(prev => [newAnnouncement, ...prev]);
      }

      setIsFormOpen(false);
      setEditingAnnouncement(null);
      return;
    }

    try {
      if (editingAnnouncement) {
        // Update existing announcement
        const { error } = await supabase
          .from('announcements')
          .update({
            title,
            description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingAnnouncement.id);

        if (error) throw error;
      } else {
        // Create new announcement
        const { error } = await supabase
          .from('announcements')
          .insert({
            title,
            description,
            author_id: user.id,
            author_email: user.email!,
          });

        if (error) throw error;
      }

      await fetchAnnouncements();
      setIsFormOpen(false);
      setEditingAnnouncement(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este anuncio?')) {
      // For test user, simulate deletion from mock data
      if (user?.email === 'gonzalo.ivjn@gmail.com') {
        setAnnouncements(prev => prev.filter(ann => ann.id !== id));
        return;
      }

      try {
        const { error } = await supabase
          .from('announcements')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await fetchAnnouncements();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleNewAnnouncement = () => {
    setEditingAnnouncement(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAnnouncement(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tablón de Anuncios</h2>
          <p className="text-gray-600 mt-1">
            Comparte y descubre anuncios de la comunidad
          </p>
        </div>
        <button
          onClick={handleNewAnnouncement}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Anuncio
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <p className="text-lg mb-2">No hay anuncios aún</p>
            <p className="text-sm">¡Sé el primero en publicar un anuncio!</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              isOwner={user?.id === announcement.author_id}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <AnnouncementForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        editingAnnouncement={editingAnnouncement}
      />
    </div>
  );
};

export default Dashboard;