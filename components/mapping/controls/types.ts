export interface ControlButtonProps {
    icon: React.ReactNode;
    onPress: () => void;
    bgColor: string;
  }
  
  export interface ToolbarButtonProps {
    icon: React.ReactNode;
    label: string;
    onPress: () => void;
    color: string;
    disabled?: boolean;
  }
  
  export type MapViewMode = 'normal' | 'zones' | 'heatmap' | 'timeline';