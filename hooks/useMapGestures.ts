import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  // Se precisar rodar algo na thread JS a partir da UI thread (raro para este caso de uso):
  // runOnJS,
} from 'react-native-reanimated';
import { useCallback } from 'react';

// Tipos de configuração (mantidos do seu original)
type MapGesturesConfig = {
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  // maxTranslation não estava sendo usado, pode ser adicionado se necessário para limitar o pan
};

const DEFAULT_CONFIG: Required<MapGesturesConfig> = {
  initialScale: 1,
  minScale: 0.5,
  maxScale: 3,
};

// Configuração de mola para Reanimated (pode ajustar para o feel desejado)
const SPRING_CONFIG_RESET = {
  damping: 15,
  stiffness: 120,
  mass: 1,
};

const SPRING_CONFIG_ZOOM_BUTTON = {
  damping: 12,
  stiffness: 150,
  mass: 1,
};


export function useMapGestures(config: MapGesturesConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Valores compartilhados do Reanimated para translação e escala
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(finalConfig.initialScale);

  // Valores salvos para permitir que os gestos sejam cumulativos
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const savedScale = useSharedValue(finalConfig.initialScale);

  // Gesto de Arrastar (Pan)
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      // Salva o estado atual da translação ANTES de o dedo se mover (se já houve pan)
      // No entanto, para o pan, é mais comum que o offset seja aplicado no onEnd do gesto anterior
      // e o onUpdate some o delta do gesto atual ao offset.
      // A lógica abaixo já considera isso com savedTranslateX/Y.
    })
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
      // TODO: Adicionar lógica de clamping para translateX.value e translateY.value se desejar
      //       Ex: não permitir que o mapa saia completamente da tela.
      //       Isso dependeria das dimensões do conteúdo do mapa e da view.
    })
    .onEnd(() => {
      // Salva a posição final da translação para o próximo gesto
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Gesto de Pinça (Pinch) para Zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      // Aplica a escala do evento à escala salva, respeitando os limites
      const newScale = savedScale.value * event.scale;
      scale.value = Math.max(finalConfig.minScale, Math.min(newScale, finalConfig.maxScale));
    })
    .onEnd(() => {
      // Salva a escala final para o próximo gesto
      savedScale.value = scale.value;
    });

  // Combina os gestos para que possam ocorrer simultaneamente
  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  // Estilo animado para aplicar à View do mapa
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  // Função para resetar a visualização
  const resetView = useCallback(() => {
    translateX.value = withSpring(0, SPRING_CONFIG_RESET);
    translateY.value = withSpring(0, SPRING_CONFIG_RESET);
    scale.value = withSpring(finalConfig.initialScale, SPRING_CONFIG_RESET);

    // Reseta também os valores salvos
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    savedScale.value = finalConfig.initialScale;
  }, [translateX, translateY, scale, savedTranslateX, savedTranslateY, savedScale, finalConfig.initialScale]);

  // Função para Zoom In (via botão)
  const zoomIn = useCallback(() => {
    // Lê o valor atual da escala diretamente do shared value
    const currentActualScale = scale.value;
    const nextScale = Math.min(currentActualScale + 0.2, finalConfig.maxScale);
    if (nextScale !== currentActualScale) { // Evita animação desnecessária se já estiver no máximo
        scale.value = withSpring(nextScale, SPRING_CONFIG_ZOOM_BUTTON);
        savedScale.value = nextScale; // Atualiza o valor salvo para consistência com pinch
    }
  }, [scale, savedScale, finalConfig.maxScale]);

  // Função para Zoom Out (via botão)
  const zoomOut = useCallback(() => {
    const currentActualScale = scale.value;
    const nextScale = Math.max(currentActualScale - 0.2, finalConfig.minScale);
     if (nextScale !== currentActualScale) { // Evita animação desnecessária
        scale.value = withSpring(nextScale, SPRING_CONFIG_ZOOM_BUTTON);
        savedScale.value = nextScale; // Atualiza o valor salvo
    }
  }, [scale, savedScale, finalConfig.minScale]);

  return {
    gesture: composedGesture, // Este objeto de gesto será passado para <GestureDetector>
    transformStyle: animatedStyle, // Este estilo animado será aplicado à sua Animated.View (do Reanimated)
    panHandlers: { gesture: composedGesture }, // Para compatibilidade com o código existente
    zoomIn,
    zoomOut,
    resetView,
    // Opcional: retornar a referência 'scale' se você precisar observar seu valor fora do hook,
    // mas geralmente as funções de controle como zoomIn/Out são suficientes.
    // currentScale: scale, // Lembre-se que 'scale' é um SharedValue, acesse com scale.value
  };
}