import React from 'react';
import { Calendar, User, Edit, Trash2 } from 'lucide-react';
import { Database } from '../lib/supabase';

type Announcement = Database['public']['Tables']['announcements']['Row'];

interface AnnouncementCardProps {
  announcement: Announcement;
  isOwner: boolean;
  onEdit: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  isOwner,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-blue-200">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
          {announcement.title}
        </h3>
        {isOwner && (
          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => onEdit(announcement)}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              title="Editar anuncio"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(announcement.id)}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              title="Eliminar anuncio"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">
        {announcement.description}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>{announcement.author_email}</span>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(announcement.created_at)}</span>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard;