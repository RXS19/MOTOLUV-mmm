import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, ArrowLeft, ImagePlus, X, Save, Upload, Camera, Calculator, DollarSign, Info } from 'lucide-react';
import { motoApi, uploadApi, resolveImageUrl } from '../services/api';
import { toast } from '../hooks/use-toast';
import { calculateCommission } from '../utils/commission';

const BRANDS = ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'Ducati', 'Harley-Davidson', 'BMW', 'KTM', 'Triumph', 'Aprilia', 'Otra'];
const CATEGORIES = ['Deportiva', 'Naked', 'Cruiser', 'Adventure', 'Scooter', 'Touring', 'Trail', 'Custom'];
const CITIES = ['Ciudad de México', 'Guadalajara', 'Monterrey', 'Puebla', 'Querétaro', 'Tijuana', 'León', 'Mérida', 'Toluca', 'CDMX'];
const MAX_IMAGES = 6;

const CreateMotoPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    brand: 'Honda', model: '', year: new Date().getFullYear(), km: 0,
    color: '', engine: '', category: 'Naked', city: 'Ciudad de México',
    price: '', description: '',
  });
  const [images, setImages] = useState([]); // array of { url }

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast({ title: 'Límite alcanzado', description: `Máximo ${MAX_IMAGES} imágenes por publicación.` });
      return;
    }
    const toUpload = files.slice(0, remaining);
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of toUpload) {
        if (!file.type.startsWith('image/')) {
          toast({ title: 'Formato inválido', description: `${file.name} no es una imagen.` });
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          toast({ title: 'Archivo muy grande', description: `${file.name} supera los 10MB.` });
          continue;
        }
        const res = await uploadApi.image(file);
        uploaded.push(res.url);
      }
      setImages([...images, ...uploaded]);
      if (uploaded.length > 0) {
        toast({ title: `${uploaded.length} imagen(es) subida(s)`, description: 'Listas para publicar.' });
      }
    } catch (err) {
      toast({ title: 'Error al subir', description: err?.response?.data?.detail || 'Intenta de nuevo.' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx) => setImages(images.filter((_, i) => i !== idx));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.model || !form.color || !form.engine || !form.price) {
      toast({ title: 'Campos incompletos', description: 'Completa todos los campos requeridos.' });
      return;
    }
    if (images.length === 0) {
      toast({ title: 'Sube al menos 1 imagen', description: 'Necesitas fotos reales de la motocicleta.' });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        year: Number(form.year), km: Number(form.km), price: Number(form.price),
        images: images,
      };
      const moto = await motoApi.create(payload);
      toast({ title: '¡Publicación creada!', description: `Tu ${moto.brand} ${moto.model} ya está en el catálogo.` });
      setTimeout(() => navigate('/panel/mis-motos'), 500);
    } catch (err) {
      toast({ title: 'Error al publicar', description: err?.response?.data?.detail || 'Intenta de nuevo.' });
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-5 lg:px-8 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-brand transition-colors mb-4">
        <ArrowLeft size={12} /> Volver
      </button>
      <div className="mb-8">
        <h1 className="font-display font-bold text-white text-3xl md:text-4xl uppercase">
          Publicar <span className="text-red-brand">Motocicleta</span>
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">Completa la ficha técnica y sube fotos reales de tu moto.</p>
      </div>

      <form onSubmit={submit} className="bg-[#111112] border border-white/5 rounded-md p-6 md:p-8 space-y-8">
        <section>
          <SectionTitle icon={Bike}>Información básica</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <SelectField label="Marca" value={form.brand} onChange={(v) => update('brand', v)} options={BRANDS} />
            <TextField label="Modelo" value={form.model} onChange={(v) => update('model', v)} placeholder="Ninja 400, MT-07, etc." required />
            <SelectField label="Categoría" value={form.category} onChange={(v) => update('category', v)} options={CATEGORIES} />
            <TextField label="Año" type="number" value={form.year} onChange={(v) => update('year', v)} required />
          </div>
        </section>

        <section>
          <SectionTitle>Especificaciones</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <TextField label="Kilometraje" type="number" value={form.km} onChange={(v) => update('km', v)} placeholder="0" required />
            <TextField label="Motor / Cilindrada" value={form.engine} onChange={(v) => update('engine', v)} placeholder="689cc, 999cc, etc." required />
            <TextField label="Color" value={form.color} onChange={(v) => update('color', v)} placeholder="Rojo, Negro, Azul..." required />
            <SelectField label="Ciudad" value={form.city} onChange={(v) => update('city', v)} options={CITIES} />
          </div>
        </section>

        <section>
          <SectionTitle icon={DollarSign}>Precio y Desglose de Comisión</SectionTitle>
          <div className="mt-4 space-y-4">
            <TextField label="Precio de Publicación (MXN)" type="number" value={form.price} onChange={(v) => update('price', v)} placeholder="95000" required />

            {form.price && Number(form.price) > 0 && (() => {
              const comm = calculateCommission(form.price);
              return (
                <div className="p-4 bg-[#0a0a0a] border border-red-brand/30 rounded-md space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-white/5 pb-2">
                    <span className="flex items-center gap-1.5 font-medium text-white">
                      <Calculator size={14} className="text-red-brand" /> Regla de Comisión Aplicada
                    </span>
                    <span className="bg-red-brand/10 text-red-brand font-bold px-2 py-0.5 rounded-sm border border-red-brand/30">
                      Tasa del {comm.percentageLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-[#111112] p-2.5 rounded-sm border border-white/5">
                      <span className="text-zinc-500 block text-[10px] uppercase">Precio Publicado</span>
                      <span className="text-white font-bold text-sm">${comm.price.toLocaleString()} MXN</span>
                    </div>

                    <div className="bg-[#111112] p-2.5 rounded-sm border border-white/5">
                      <span className="text-zinc-500 block text-[10px] uppercase">Comisión Motoluv ({comm.percentageLabel})</span>
                      <span className="text-red-brand font-bold text-sm">-${comm.commissionAmount.toLocaleString()} MXN</span>
                    </div>

                    <div className="bg-emerald-500/10 p-2.5 rounded-sm border border-emerald-500/30 col-span-2 md:col-span-1">
                      <span className="text-emerald-400 block text-[10px] uppercase font-bold">Tu Depósito Neto</span>
                      <span className="text-emerald-300 font-bold text-sm">${comm.netEarnings.toLocaleString()} MXN</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-[11px] text-zinc-500 pt-1">
                    <Info size={12} className="text-zinc-400 mt-0.5 flex-shrink-0" />
                    <span>La comisión se descuenta únicamente al momento de concretar la venta y liberación del depósito en garantía.</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        <section>
          <SectionTitle>Descripción</SectionTitle>
          <div className="mt-4">
            <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">Describe tu moto</label>
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
              placeholder="Estado, mantenimientos, accesorios incluidos, historia..." rows={4}
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors placeholder:text-zinc-600 resize-none" />
          </div>
        </section>

        {/* Photo Upload */}
        <section>
          <SectionTitle icon={Camera}>Fotografías ({images.length}/{MAX_IMAGES}) <span className="text-red-brand">*</span></SectionTitle>
          <p className="text-xs text-zinc-500 mt-1">Sube fotos reales de tu motocicleta. Formatos: JPG, PNG, WEBP. Máx 10MB c/u.</p>

          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />

          {images.length === 0 ? (
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="mt-4 w-full border-2 border-dashed border-white/10 hover:border-red-brand hover:bg-red-brand/5 rounded-md py-14 flex flex-col items-center justify-center gap-3 transition-colors disabled:opacity-60 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-red-brand/10 border border-red-brand/40 flex items-center justify-center">
                <Upload size={20} className="text-red-brand" />
              </div>
              <div className="text-white text-sm font-medium">{uploading ? 'Subiendo...' : 'Haz clic para subir fotos'}</div>
              <div className="text-zinc-500 text-xs">o arrastra tus imágenes aquí</div>
            </button>
          ) : (
            <div className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((url, i) => (
                  <div key={i} className="relative aspect-video rounded-md overflow-hidden bg-[#0a0a0a] border border-white/5 group">
                    <img src={resolveImageUrl(url)} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <div className="absolute top-2 left-2 bg-red-brand text-white text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-sm">
                        Portada
                      </div>
                    )}
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-red-brand text-white flex items-center justify-center transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="aspect-video border-2 border-dashed border-white/10 hover:border-red-brand hover:bg-red-brand/5 rounded-md flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-60">
                    <ImagePlus size={20} className="text-red-brand" />
                    <span className="text-xs text-zinc-400">{uploading ? 'Subiendo...' : 'Agregar más'}</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 mt-2">La primera imagen será la portada del anuncio.</p>
            </div>
          )}
        </section>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-white/5">
          <button type="button" onClick={() => navigate(-1)} className="btn-outline flex-1 sm:flex-initial text-xs font-bold tracking-widest uppercase px-6 py-3.5 rounded-sm">
            Cancelar
          </button>
          <button type="submit" disabled={loading || uploading} className="btn-red flex-1 inline-flex items-center justify-center gap-2 text-xs font-bold tracking-widest uppercase px-6 py-3.5 rounded-sm disabled:opacity-70">
            <Save size={14} /> {loading ? 'Publicando...' : 'Publicar Motocicleta'}
          </button>
        </div>
      </form>
    </div>
  );
};

const SectionTitle = ({ icon: Icon, children }) => (
  <h3 className="font-display font-bold text-white uppercase tracking-wide text-sm flex items-center gap-2">
    {Icon && <Icon size={14} className="text-red-brand" />} {children}
  </h3>
);

const TextField = ({ label, type = 'text', value, onChange, placeholder, required }) => (
  <div>
    <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">
      {label} {required && <span className="text-red-brand">*</span>}
    </label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors placeholder:text-zinc-600" />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="text-xs text-zinc-500 uppercase tracking-widest mb-2 block">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 focus:border-red-brand text-white text-sm rounded-sm outline-none transition-colors">
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export default CreateMotoPage;
