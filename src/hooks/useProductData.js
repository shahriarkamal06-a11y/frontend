import { useState, useEffect } from 'react';
import { productAPI, categoryAPI } from '../services/api';
import { normalizeCategory } from './useApi';
import { buildCategoryTree, flattenCategoryTree } from '../utils/categoryTree';
import toast from 'react-hot-toast';

export const useProductData = (productId = null) => {
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load categories - same logic as AdminProductManagement
      const categoriesResponse = await categoryAPI.getCategories({ limit: 500, page: 1 });
      const categoryItems = categoriesResponse.data.data?.items || [];
      const normalizedCategories = categoryItems.map(normalizeCategory);
      const categoryTree = buildCategoryTree(normalizedCategories);
      setCategories(flattenCategoryTree(categoryTree));

      // Load product if editing - same logic as AdminProductManagement
      if (productId) {
        const productResponse = await productAPI.getProductById(productId);
        setProduct(productResponse.data.data || productResponse.data);
      }
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [productId]);

  return { product, categories, isLoading, refetch: loadData };
};
