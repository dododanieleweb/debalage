import { Link } from 'react-router-dom';
import { MapPin, Calendar, Clock, Users, Package } from 'lucide-react';
import { Event } from '../types';
import { EVENT_TYPES } from '../data/mockData';
import { useApp } from '../context/AppContext';

interface Props {
  event: Event;
  featured?: boolean;
}

export default function EventCard({ event, featured = false }: Props) {
  const { state } = useApp();
  const seller = state.users.find(u => u.id === event.sellerId);
  const eventType = EVENT_TYPES[event.type];
  const dateObj = new Date(event.date);
  const formattedDate = dateObj.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const spotsLeft = event.maxAttendees ? event.maxAttendees - event.currentAttendees : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <Link to={`/evento/${event.id}`} className="group block">
      <div className={`card overflow-hidden ${featured ? 'md:flex' : ''}`}>
        {/* Image */}
        <div className={`relative overflow-hidden bg-cream-100 ${featured ? 'md:w-2/5 md:h-auto h-56' : 'h-52'}`}>
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bark-900/50 to-transparent" />

          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <span className={`badge ${eventType.color}`}>
              {eventType.icon} {eventType.label}
            </span>
          </div>

          {/* Status badge */}
          {event.status === 'ongoing' && (
            <div className="absolute top-3 right-3">
              <span className="badge bg-emerald-500 text-white">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                In corso
              </span>
            </div>
          )}
          {event.status === 'completed' && (
            <div className="absolute top-3 right-3">
              <span className="badge bg-bark-600 text-cream-200">Concluso</span>
            </div>
          )}

          {/* City on image */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-sans">
            <MapPin size={13} />
            <span>{event.city}</span>
          </div>
        </div>

        {/* Content */}
        <div className={`p-5 flex flex-col justify-between ${featured ? 'md:w-3/5' : ''}`}>
          <div>
            <h3 className={`font-serif text-bark-900 leading-snug mb-2 group-hover:text-vintage-700 transition-colors ${featured ? 'text-xl' : 'text-base'}`}>
              {event.title}
            </h3>

            {featured && (
              <p className="text-sm text-bark-500 font-sans leading-relaxed mb-4 line-clamp-3">
                {event.description}
              </p>
            )}

            <div className="space-y-2 text-xs text-bark-500 font-sans">
              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-vintage-500 shrink-0" />
                <span>{formattedDate}</span>
                {event.endDate && event.endDate !== event.date && (
                  <span>→ {new Date(event.endDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-vintage-500 shrink-0" />
                <span>{event.timeStart} – {event.timeEnd}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-vintage-500 shrink-0" />
                <span className="truncate">{event.address}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-cream-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-bark-400 font-sans">
                <span className="flex items-center gap-1">
                  <Package size={13} />
                  {event.productsCount} pezzi
                </span>
                {spotsLeft !== null && (
                  <span className={`flex items-center gap-1 ${isFull ? 'text-rose-500' : spotsLeft <= 5 ? 'text-amber-600' : ''}`}>
                    <Users size={13} />
                    {isFull ? 'Completo' : `${spotsLeft} posti`}
                  </span>
                )}
              </div>

              {seller && (
                <div className="flex items-center gap-2">
                  <img src={seller.avatar} alt={seller.name} className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-xs text-bark-500 hidden sm:block">{seller.name.split(' ')[0]}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
