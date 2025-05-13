import { StyleSheet } from 'react-native';

export const controlStyles = StyleSheet.create({
  shadow: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rounded: {
    borderRadius: 8,
  },
});

export const panelStyles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
  },
  content: {
    paddingTop: 12,
  },
});