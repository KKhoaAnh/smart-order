'use client';

import { useEffect, useState } from 'react';
import { Plus, Coffee, UtensilsCrossed } from 'lucide-react';
import { PageHeader } from '@/app/components/layout/PageHeader';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';
import { Badge } from '@/app/components/ui/Badge';
import { Switch } from '@/app/components/ui/Switch';
import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';
import { Select } from '@/app/components/ui/Select';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { SearchInput } from '@/app/components/ui/SearchInput';
import { useMenu } from '@/app/hooks/useMenu';
import { useAuthStore } from '@/app/stores/authStore';
import { formatPrice } from '@/app/lib/format';
import { cn } from '@/app/lib/utils';
import toast from 'react-hot-toast';

export default function MenuPage() {
  const { user } = useAuthStore();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { categories, loading, fetchMenu, createCat, updateCat, deleteCat, createProd, updateProd, deleteProd, toggleAvail } = useMenu();
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [catModal, setCatModal] = useState<{ open: boolean; data?: any }>({ open: false });
  const [prodModal, setProdModal] = useState<{ open: boolean; data?: any }>({ open: false });
  const [catForm, setCatForm] = useState({ name: '', priority: 0 });
  const [prodForm, setProdForm] = useState({ name: '', description: '', base_price: 0, category_id: '', image_url: '' });

  const storeId = user?.store_id;

  useEffect(() => {
    if (storeId) fetchMenu(storeId);
  }, [storeId, fetchMenu]);

  const allProducts = categories.flatMap((cat: any) =>
    (cat.products || []).map((p: any) => ({ ...p, category_name: cat.name, category_id: cat.id }))
  );

  const filteredProducts = allProducts.filter((p: any) => {
    if (selectedCatId && p.category_id !== selectedCatId) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSaveCat = async () => {
    try {
      if (catModal.data?.id) {
        await updateCat(catModal.data.id, catForm, storeId!);
      } else {
        await createCat(storeId!, catForm);
      }
      setCatModal({ open: false });
    } catch (err: any) {
      toast.error(err.message || 'Lỗi lưu danh mục');
    }
  };

  const handleSaveProd = async () => {
    try {
      const data = { ...prodForm, base_price: Number(prodForm.base_price), category_id: Number(prodForm.category_id) };
      if (prodModal.data?.id) {
        await updateProd(prodModal.data.id, data, storeId!);
      } else {
        await createProd(data, storeId!);
      }
      setProdModal({ open: false });
    } catch (err: any) {
      toast.error(err.message || 'Lỗi lưu sản phẩm');
    }
  };

  return (
    <div>
      <PageHeader title="Thực đơn" subtitle="Quản lý danh mục và sản phẩm">
        <SearchInput value={search} onChange={setSearch} placeholder="Tìm sản phẩm..." className="w-56" />
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => {
          setProdForm({ name: '', description: '', base_price: 0, category_id: categories[0]?.id?.toString() || '', image_url: '' });
          setProdModal({ open: true });
        }}>
          Thêm sản phẩm
        </Button>
      </PageHeader>

      <div className="flex gap-6">
        {/* Category Sidebar */}
        <div className="w-56 shrink-0">
          <div className="space-y-1 mb-4">
            <button
              onClick={() => setSelectedCatId(null)}
              className={cn('w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                !selectedCatId ? 'bg-brand-primary text-white' : 'text-text-secondary hover:bg-bg-secondary'
              )}
            >
              Tất cả ({allProducts.length})
            </button>
            {categories.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={cn('w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between',
                  selectedCatId === cat.id ? 'bg-brand-primary text-white' : 'text-text-secondary hover:bg-bg-secondary'
                )}
              >
                <span className="truncate">{cat.name}</span>
                <span className="text-xs opacity-70">{cat.products?.length || 0}</span>
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" fullWidth onClick={() => {
            setCatForm({ name: '', priority: 0 });
            setCatModal({ open: true });
          }}>
            + Thêm danh mục
          </Button>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <Skeleton className="h-56 rounded-xl" count={8} />
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState icon={<UtensilsCrossed className="w-12 h-12" />} title="Chưa có sản phẩm" description="Thêm sản phẩm mới vào thực đơn" />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product: any) => (
                <Card key={product.id} hover padding="none" onClick={() => {
                  setProdForm({
                    name: product.name, description: product.description || '',
                    base_price: product.base_price, category_id: product.category_id?.toString(),
                    image_url: product.image_url || '',
                  });
                  setProdModal({ open: true, data: product });
                }}>
                  <div className="h-32 bg-bg-secondary rounded-t-xl flex items-center justify-center">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-t-xl" />
                    ) : (
                      <Coffee className="w-10 h-10 text-brand-light" />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-text-primary truncate">{product.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-brand-primary">{formatPrice(product.base_price)}</span>
                      <Switch
                        checked={product.is_available !== false}
                        onChange={() => toggleAvail(product.id, storeId!)}
                        label=""
                      />
                    </div>
                    {product.is_popular && <Badge variant="cooking" className="mt-2">Hot</Badge>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      <Modal isOpen={catModal.open} onClose={() => setCatModal({ open: false })} title={catModal.data ? 'Sửa danh mục' : 'Thêm danh mục'} size="sm"
        footer={<Button onClick={handleSaveCat}>Lưu</Button>}>
        <div className="space-y-4">
          <Input label="Tên danh mục" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} />
          <Input label="Thứ tự" type="number" value={catForm.priority} onChange={e => setCatForm({ ...catForm, priority: Number(e.target.value) })} />
        </div>
      </Modal>

      {/* Product Modal */}
      <Modal isOpen={prodModal.open} onClose={() => setProdModal({ open: false })} title={prodModal.data ? 'Sửa sản phẩm' : 'Thêm sản phẩm'} size="lg"
        footer={<Button onClick={handleSaveProd}>Lưu</Button>}>
        <div className="space-y-4">
          <Input label="Tên sản phẩm" value={prodForm.name} onChange={e => setProdForm({ ...prodForm, name: e.target.value })} />
          <Input label="Mô tả" value={prodForm.description} onChange={e => setProdForm({ ...prodForm, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Giá (VNĐ)" type="number" value={prodForm.base_price} onChange={e => setProdForm({ ...prodForm, base_price: Number(e.target.value) })} />
            <Select label="Danh mục" value={prodForm.category_id} onChange={e => setProdForm({ ...prodForm, category_id: e.target.value })}
              options={categories.map((c: any) => ({ value: c.id.toString(), label: c.name }))} />
          </div>
          <Input label="URL hình ảnh" value={prodForm.image_url} onChange={e => setProdForm({ ...prodForm, image_url: e.target.value })} placeholder="https://..." />
        </div>
      </Modal>
    </div>
  );
}
