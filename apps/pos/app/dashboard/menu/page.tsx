'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Coffee, UtensilsCrossed, ShieldAlert, Package, Trash2 } from 'lucide-react';
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
import { useAuth } from '@/app/hooks/useAuth';
import { useAuthStore } from '@/app/stores/authStore';
import { formatPrice } from '@/app/lib/format';
import { cn } from '@/app/lib/utils';
import { combosApi } from '@/app/lib/api';
import toast from 'react-hot-toast';

export default function MenuPage() {
  const { user } = useAuthStore();
  const { canManage } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { categories, loading, fetchMenu, createCat, updateCat, deleteCat, createProd, updateProd, deleteProd, toggleAvail } = useMenu();
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [catModal, setCatModal] = useState<{ open: boolean; data?: any }>({ open: false });
  const [prodModal, setProdModal] = useState<{ open: boolean; data?: any }>({ open: false });
  const [catForm, setCatForm] = useState({ name: '', priority: 0 });
  const [prodForm, setProdForm] = useState({ name: '', description: '', base_price: 0, category_id: '', image_url: '' });

  // Combo state
  const [activeTab, setActiveTab] = useState<'products' | 'combos'>('products');
  const [combos, setCombos] = useState<any[]>([]);
  const [comboModal, setComboModal] = useState<{ open: boolean; data?: any }>({ open: false });
  const [comboForm, setComboForm] = useState({ name: '', description: '', combo_price: 0, image_url: '', selectedProducts: [] as { product_id: number; quantity: number }[] });

  const storeId = user?.store_id;

  const fetchCombos = useCallback(async () => {
    if (!storeId) return;
    try {
      const data = await combosApi.getAll(storeId);
      setCombos(Array.isArray(data) ? data : []);
    } catch {
      setCombos([]);
    }
  }, [storeId]);

  useEffect(() => {
    if (storeId) {
      fetchMenu(storeId);
      fetchCombos();
    }
  }, [storeId, fetchMenu, fetchCombos]);

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

  // Combo handlers
  const handleSaveCombo = async () => {
    try {
      const data = {
        name: comboForm.name,
        description: comboForm.description || undefined,
        combo_price: Number(comboForm.combo_price),
        image_url: comboForm.image_url || undefined,
        items: comboForm.selectedProducts.filter(p => p.product_id > 0).map(p => ({
          product_id: p.product_id,
          quantity: p.quantity || 1,
        })),
      };
      if (comboModal.data?.id) {
        await combosApi.update(comboModal.data.id, data);
        toast.success('Đã cập nhật combo');
      } else {
        await combosApi.create(storeId!, data);
        toast.success('Đã tạo combo mới');
      }
      setComboModal({ open: false });
      fetchCombos();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Lỗi lưu combo');
    }
  };

  const handleDeleteCombo = async (id: number) => {
    if (!confirm('Xóa combo này?')) return;
    try {
      await combosApi.delete(id);
      toast.success('Đã xóa combo');
      fetchCombos();
    } catch {
      toast.error('Lỗi xóa combo');
    }
  };

  const toggleComboProduct = (productId: number) => {
    setComboForm(prev => {
      const existing = prev.selectedProducts.find(p => p.product_id === productId);
      if (existing) {
        return { ...prev, selectedProducts: prev.selectedProducts.filter(p => p.product_id !== productId) };
      }
      return { ...prev, selectedProducts: [...prev.selectedProducts, { product_id: productId, quantity: 1 }] };
    });
  };

  return (
    <div>
      <PageHeader title="Thực đơn" subtitle={canManage ? 'Quản lý danh mục, sản phẩm và combo' : 'Xem danh mục và sản phẩm'}>
        <SearchInput value={search} onChange={setSearch} placeholder="Tìm sản phẩm..." className="w-56" />
        {canManage && activeTab === 'products' && (
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => {
            setProdForm({ name: '', description: '', base_price: 0, category_id: categories[0]?.id?.toString() || '', image_url: '' });
            setProdModal({ open: true });
          }}>
            Thêm sản phẩm
          </Button>
        )}
        {canManage && activeTab === 'combos' && (
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => {
            setComboForm({ name: '', description: '', combo_price: 0, image_url: '', selectedProducts: [] });
            setComboModal({ open: true });
          }}>
            Tạo Combo
          </Button>
        )}
      </PageHeader>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-4 bg-bg-secondary rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('products')}
          className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'products' ? 'bg-white text-brand-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
          )}
        >
          <Coffee className="w-4 h-4 inline mr-1.5" />
          Sản phẩm
        </button>
        <button
          onClick={() => setActiveTab('combos')}
          className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeTab === 'combos' ? 'bg-white text-brand-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
          )}
        >
          <Package className="w-4 h-4 inline mr-1.5" />
          Combo ({combos.length})
        </button>
      </div>

      {/* Read-only banner for non-admin */}
      {!canManage && (
        <div className="mb-4 flex items-center gap-3 bg-warning-bg border border-warning/20 rounded-xl px-4 py-3 animate-fade-in">
          <ShieldAlert className="w-5 h-5 text-warning flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-text-primary">Chế độ xem</p>
            <p className="text-xs text-text-secondary">Bạn chỉ có thể xem thực đơn. Liên hệ quản lý để thay đổi.</p>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
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
          {canManage && (
            <Button variant="ghost" size="sm" fullWidth onClick={() => {
              setCatForm({ name: '', priority: 0 });
              setCatModal({ open: true });
            }}>
              + Thêm danh mục
            </Button>
          )}
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
                <Card key={product.id} hover padding="none" onClick={canManage ? () => {
                  setProdForm({
                    name: product.name, description: product.description || '',
                    base_price: product.base_price, category_id: product.category_id?.toString(),
                    image_url: product.image_url || '',
                  });
                  setProdModal({ open: true, data: product });
                } : undefined}>
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
                      <span className="font-bold text-brand-primary">{formatPrice(Number(product.base_price))}</span>
                      {canManage ? (
                        <Switch
                          checked={product.is_available !== false}
                          onChange={() => toggleAvail(product.id, storeId!)}
                          label=""
                        />
                      ) : (
                        <span className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                          product.is_available !== false
                            ? 'bg-success-bg text-success'
                            : 'bg-error-bg text-error'
                        )}>
                          {product.is_available !== false ? 'Còn hàng' : 'Hết hàng'}
                        </span>
                      )}
                    </div>
                    {product.is_popular && <Badge variant="cooking" className="mt-2">Hot</Badge>}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {/* Combos Tab */}
      {activeTab === 'combos' && (
        <div className="flex-1">
          {combos.length === 0 ? (
            <EmptyState icon={<Package className="w-12 h-12" />} title="Chưa có combo" description="Tạo combo để tăng giá trị đơn hàng" />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {combos.map((combo: any) => (
                <Card key={combo.id} hover padding="none" onClick={canManage ? () => {
                  setComboForm({
                    name: combo.name,
                    description: combo.description || '',
                    combo_price: combo.combo_price,
                    image_url: combo.image_url || '',
                    selectedProducts: (combo.items || []).map((i: any) => ({ product_id: i.product_id, quantity: i.quantity || 1 })),
                  });
                  setComboModal({ open: true, data: combo });
                } : undefined}>
                  <div className="h-28 rounded-t-xl flex items-center justify-center" style={{ background: combo.image_url ? `url(${combo.image_url}) center/cover` : 'linear-gradient(135deg, #6F4E37, #D4B896)' }}>
                    {!combo.image_url && <Package className="w-10 h-10 text-white/70" />}
                    {combo.save_percent > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        -{combo.save_percent}%
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-text-primary truncate">{combo.name}</h3>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      {(combo.items || []).map((i: any) => i.product_name).join(', ')}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <span className="text-[11px] text-text-tertiary line-through mr-1">{formatPrice(combo.original_price)}</span>
                        <span className="font-bold text-brand-primary">{formatPrice(combo.combo_price)}</span>
                      </div>
                      {canManage && (
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCombo(combo.id); }}
                          className="p-1 rounded hover:bg-error-bg transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-error" />
                        </button>
                      )}
                    </div>
                    <Badge variant={combo.is_active ? 'confirmed' : 'cancelled'} className="mt-2">
                      {combo.is_active ? 'Đang bán' : 'Tạm ẩn'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Modal — only for admin */}
      {canManage && (
        <Modal isOpen={catModal.open} onClose={() => setCatModal({ open: false })} title={catModal.data ? 'Sửa danh mục' : 'Thêm danh mục'} size="sm"
          footer={<Button onClick={handleSaveCat}>Lưu</Button>}>
          <div className="space-y-4">
            <Input label="Tên danh mục" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} />
            <Input label="Thứ tự" type="number" value={catForm.priority} onChange={e => setCatForm({ ...catForm, priority: Number(e.target.value) })} />
          </div>
        </Modal>
      )}

      {/* Product Modal — only for admin */}
      {canManage && (
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
      )}

      {/* Combo Modal — only for admin */}
      {canManage && (
        <Modal isOpen={comboModal.open} onClose={() => setComboModal({ open: false })} title={comboModal.data ? 'Sửa Combo' : 'Tạo Combo mới'} size="lg"
          footer={<Button onClick={handleSaveCombo}>Lưu Combo</Button>}>
          <div className="space-y-4">
            <Input label="Tên Combo" value={comboForm.name} onChange={e => setComboForm({ ...comboForm, name: e.target.value })} placeholder="VD: Combo Sáng" />
            <Input label="Mô tả" value={comboForm.description} onChange={e => setComboForm({ ...comboForm, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Giá Combo (VNĐ)" type="number" value={comboForm.combo_price} onChange={e => setComboForm({ ...comboForm, combo_price: Number(e.target.value) })} />
              <Input label="URL hình ảnh" value={comboForm.image_url} onChange={e => setComboForm({ ...comboForm, image_url: e.target.value })} placeholder="https://..." />
            </div>

            {/* Product picker */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Chọn sản phẩm trong Combo</label>
              <div className="max-h-60 overflow-y-auto border border-border-primary rounded-xl p-2 space-y-1">
                {allProducts.map((p: any) => {
                  const isSelected = comboForm.selectedProducts.some(sp => sp.product_id === p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleComboProduct(p.id)}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors',
                        isSelected ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/30' : 'hover:bg-bg-secondary text-text-secondary'
                      )}
                    >
                      <span>{p.name} — {formatPrice(Number(p.base_price))}</span>
                      <span className="text-xs">{p.category_name}</span>
                    </button>
                  );
                })}
              </div>
              {comboForm.selectedProducts.length > 0 && (
                <p className="text-xs text-text-secondary mt-1">
                  Đã chọn {comboForm.selectedProducts.length} sản phẩm • Giá gốc: {formatPrice(comboForm.selectedProducts.reduce((sum, sp) => {
                    const prod = allProducts.find((p: any) => p.id === sp.product_id);
                    return sum + (prod ? Number(prod.base_price) * sp.quantity : 0);
                  }, 0))}
                  {comboForm.combo_price > 0 && (
                    <> • Tiết kiệm: {formatPrice(comboForm.selectedProducts.reduce((sum, sp) => {
                      const prod = allProducts.find((p: any) => p.id === sp.product_id);
                      return sum + (prod ? Number(prod.base_price) * sp.quantity : 0);
                    }, 0) - comboForm.combo_price)}</>
                  )}
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
