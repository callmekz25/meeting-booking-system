import { useQuery } from '@tanstack/react-query';
import { getEquipmentType } from '../api/equipmentType.api';

export const useGetEquipmentType = () => {
  return useQuery({
    queryKey: ['equipment-type'],
    queryFn: getEquipmentType,
  });
};
