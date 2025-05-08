import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Clock, ChevronLeft, ChevronRight, Play, Pause, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export interface TimelineEvent {
  id: string;
  entityId: string;
  entityType: 'beacon' | 'motorcycle';
  action: 'add' | 'edit' | 'delete' | 'move' | 'status_change';
  timestamp: string;
  position?: { x: number; y: number };
  zoneId?: string | null;
  details?: { [key: string]: any };
}

interface MapTimelineProps {
  events: TimelineEvent[];
  currentTime?: string;
  onTimeChange?: (timestamp: string) => void;
  onEventSelect?: (event: TimelineEvent) => void;
  zoneColors?: { [zoneId: string]: string };
  isVisible?: boolean;
  isPlayback?: boolean;
  onTogglePlayback?: () => void;
}

export const MapTimeline: React.FC<MapTimelineProps> = ({
  events,
  currentTime,
  onTimeChange,
  onEventSelect,
  zoneColors = {},
  isVisible = true,
  isPlayback = false,
  onTogglePlayback
}) => {
  const { theme } = useTheme();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const windowWidth = Dimensions.get('window').width;
  
  // Agrupar eventos por hora e contá-los
  const timelineData = useMemo(() => {
    if (!events.length) return [];
    
    // Ordenar eventos por timestamp
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Encontrar o primeiro e último timestamp
    const firstTime = new Date(sortedEvents[0].timestamp);
    const lastTime = new Date(sortedEvents[sortedEvents.length - 1].timestamp);
    
    // Calcular a duração total em minutos
    const totalDuration = (lastTime.getTime() - firstTime.getTime()) / (1000 * 60);
    
    // Se a duração for menor que 10 minutos, normalizar para visualização
    const normalizedDuration = Math.max(10, totalDuration);
    
    // Agrupar eventos por hora do dia e contar
    const groupedByHour = sortedEvents.reduce((acc, event) => {
      const eventDate = new Date(event.timestamp);
      const hourKey = `${eventDate.getHours()}:${Math.floor(eventDate.getMinutes() / 10) * 10}`;
      
      if (!acc[hourKey]) {
        acc[hourKey] = {
          time: eventDate,
          count: 0,
          events: [],
          position: ((eventDate.getTime() - firstTime.getTime()) / (1000 * 60)) / normalizedDuration
        };
      }
      
      acc[hourKey].count += 1;
      acc[hourKey].events.push(event);
      
      return acc;
    }, {} as Record<string, { time: Date; count: number; events: TimelineEvent[]; position: number }>);
    
    // Converter para array e retornar
    return Object.values(groupedByHour);
  }, [events]);
  
  // Encontrar evento atual
  const currentEvent = useMemo(() => {
    if (!currentTime) return null;
    
    const currentTimestamp = new Date(currentTime).getTime();
    
    // Encontrar o evento mais próximo do tempo atual
    let closestEvent: TimelineEvent | null = null;
    let minDiff = Infinity;
    
    events.forEach(event => {
      const eventTime = new Date(event.timestamp).getTime();
      const diff = Math.abs(eventTime - currentTimestamp);
      
      if (diff < minDiff) {
        minDiff = diff;
        closestEvent = event;
      }
    });
    
    return closestEvent;
  }, [currentTime, events]);
  
  // Função para formatar a hora
  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // Função para calcular a largura de cada bloco de eventos
  const getEventBlockWidth = (position: number) => {
    // Limitar a posição entre 0 e 1
    const safePosition = Math.max(0, Math.min(1, position));
    // Converter para porcentagem da largura da tela
    return `${safePosition * 100}%`;
  };
  
  // Função para selecionar um evento
  const handleEventSelect = (event: TimelineEvent) => {
    setSelectedEvent(event.id);
    if (onEventSelect) {
      onEventSelect(event);
    }
    if (onTimeChange) {
      onTimeChange(event.timestamp);
    }
  };
  
  // Função para navegar para o próximo evento
  const goToNextEvent = () => {
    if (!currentEvent || !currentTime) return;
    
    const currentIndex = events.findIndex(e => e.id === currentEvent.id);
    if (currentIndex < events.length - 1) {
      const nextEvent = events[currentIndex + 1];
      handleEventSelect(nextEvent);
    }
  };
  
  // Função para navegar para o evento anterior
  const goToPreviousEvent = () => {
    if (!currentEvent || !currentTime) return;
    
    const currentIndex = events.findIndex(e => e.id === currentEvent.id);
    if (currentIndex > 0) {
      const prevEvent = events[currentIndex - 1];
      handleEventSelect(prevEvent);
    }
  };
  
  // Função para obter a cor do evento baseada no tipo
  const getEventColor = (event: TimelineEvent) => {
    switch (event.entityType) {
      case 'beacon':
        return theme.colors.primary[500];
      case 'motorcycle':
        return theme.colors.secondary[500];
      default:
        return theme.colors.gray[500];
    }
  };
  
  // Função para obter o ícone do evento baseado na ação
  const getEventIcon = (event: TimelineEvent) => {
    switch (event.action) {
      case 'add':
        return '+';
      case 'edit':
        return '✎';
      case 'delete':
        return '×';
      case 'move':
        return '↔';
      case 'status_change':
        return '↻';
      default:
        return '•';
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.colors.gray[800] }]}>
        <View style={styles.titleContainer}>
          <Clock size={16} color={theme.colors.white} />
          <Text style={[styles.title, { color: theme.colors.white }]}>Linha do Tempo</Text>
        </View>
        
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={goToPreviousEvent}
            disabled={!events.length}
          >
            <ChevronLeft size={20} color={events.length ? theme.colors.white : theme.colors.gray[600]} />
          </TouchableOpacity>
          
          {onTogglePlayback && (
            <TouchableOpacity 
              style={[styles.playButton, { backgroundColor: theme.colors.primary[500] }]} 
              onPress={onTogglePlayback}
            >
              {isPlayback 
                ? <Pause size={16} color={theme.colors.white} /> 
                : <Play size={16} color={theme.colors.white} />
              }
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={goToNextEvent}
            disabled={!events.length}
          >
            <ChevronRight size={20} color={events.length ? theme.colors.white : theme.colors.gray[600]} />
          </TouchableOpacity>
        </View>
      </View>
      
      {events.length ? (
        <ScrollView horizontal style={styles.timelineScroll} showsHorizontalScrollIndicator={false}>
          <View style={styles.timeline}>
            {timelineData.map((timeBlock, index) => (
              <View 
                key={`time-${index}`} 
                style={[
                  styles.timeBlock,
                  { left: getEventBlockWidth(timeBlock.position) }
                ]}
              >
                <View 
                  style={[
                    styles.timeMarker, 
                    { 
                      height: Math.min(8 + timeBlock.count * 4, 40),
                      backgroundColor: theme.colors.primary[400]
                    }
                  ]}
                />
                <Text style={styles.timeLabel}>{formatTime(timeBlock.time)}</Text>
                
                {/* Eventos no bloco */}
                <View style={styles.eventIndicators}>
                  {timeBlock.events.map((event, eventIndex) => (
                    <TouchableOpacity
                      key={`event-${event.id}`}
                      style={[
                        styles.eventDot,
                        {
                          backgroundColor: getEventColor(event),
                          borderColor: event.id === selectedEvent ? theme.colors.white : 'transparent'
                        }
                      ]}
                      onPress={() => handleEventSelect(event)}
                    >
                      <Text style={styles.eventIcon}>{getEventIcon(event)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <AlertTriangle size={24} color={theme.colors.gray[400]} />
          <Text style={[styles.emptyText, { color: theme.colors.gray[500] }]}>
            Nenhum evento registrado
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    maxHeight: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    marginLeft: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 4,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  timelineScroll: {
    height: 70,
  },
  timeline: {
    flexDirection: 'row',
    height: 70,
    position: 'relative',
    paddingHorizontal: 20,
    width: '200%', // Para permitir o scroll
  },
  timeBlock: {
    position: 'absolute',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  timeMarker: {
    width: 3,
    borderRadius: 1.5,
  },
  timeLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: '#FFF',
    marginTop: 4,
  },
  eventIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 50,
    marginTop: 2,
  },
  eventDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderWidth: 2,
  },
  eventIcon: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyState: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginTop: 8,
  }
});