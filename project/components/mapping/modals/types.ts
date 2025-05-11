import { Motorcycle } from '@/types';

export interface ZoneModalProps {
  visible: boolean;
  editingZoneId: string | null;
  zoneName: string;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  onNameChange: (text: string) => void;
}

export interface LayoutModalProps {
  visible: boolean;
  layoutName: string;
  onClose: () => void;
  onSave: () => void;
  onNameChange: (text: string) => void;
}

export interface MotoSelectionModalProps {
  visible: boolean;
  motorcycles: Motorcycle[];
  onClose: () => void;
  onSelectMoto: (motoId: string) => void;
}

export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}