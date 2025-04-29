import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import Themes from '@/constants/Themes';

interface SectionHeaderProps {
  title: string;
  linkTo?: string;
}

export function SectionHeader({ title, linkTo }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {linkTo && (
        <Link href={linkTo} asChild>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>Ver todos</Text>
            <ChevronRight size={16} color={Themes.colors.primary[500]} />
          </TouchableOpacity>
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 16,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: Themes.colors.gray[800],
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: Themes.colors.primary[500],
    marginRight: 4,
  },
});