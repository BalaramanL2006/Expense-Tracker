import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useExpense } from '../context/ExpenseContext';
import { PAYMENT_METHODS } from '../utils/mockData';
import { FaTimes, FaUpload, FaCloudUploadAlt, FaCalendarAlt } from 'react-icons/fa';

export const TransactionModal = ({ isOpen, onClose, transaction, onSave }) => {
  const { categories, addCategory } = useExpense();
  
  // Custom category toggler state
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#8B5CF6');

  // Receipt image preview
  const [receiptPreview, setReceiptPreview] = useState(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      amount: '',
      type: 'expense',
      category: '',
      date: new Date().toISOString().substring(0, 16), // datetime-local format
      paymentMethod: 'Cash',
      recurring: false,
      tags: '',
      description: ''
    }
  });

  const selectedType = watch('type');

  // Filter categories based on income vs expense
  const filteredCategories = categories.filter(cat => cat.type === selectedType);

  // Sync edit mode fields
  useEffect(() => {
    if (transaction) {
      // Format date for datetime-local value format (YYYY-MM-DDTHH:mm)
      const txnDate = new Date(transaction.date);
      const tzOffset = txnDate.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISODate = new Date(txnDate.getTime() - tzOffset).toISOString().substring(0, 16);

      setValue('title', transaction.title);
      setValue('amount', transaction.amount);
      setValue('type', transaction.type);
      setValue('category', transaction.category);
      setValue('date', localISODate);
      setValue('paymentMethod', transaction.paymentMethod);
      setValue('recurring', transaction.recurring || false);
      setValue('tags', (transaction.tags || []).join(', '));
      setValue('description', transaction.description || '');
      setReceiptPreview(transaction.receiptImage);
    } else {
      reset({
        title: '',
        amount: '',
        type: 'expense',
        category: filteredCategories[0]?.name || '',
        date: new Date().toISOString().substring(0, 16),
        paymentMethod: 'Cash',
        recurring: false,
        tags: '',
        description: ''
      });
      setReceiptPreview(null);
    }
  }, [transaction, isOpen, setValue, reset]);

  // Set default category when type flips
  useEffect(() => {
    if (!transaction && filteredCategories.length > 0) {
      setValue('category', filteredCategories[0].name);
    }
  }, [selectedType]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    const formattedData = {
      ...data,
      amount: parseFloat(data.amount),
      tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t !== '') : [],
      receiptImage: receiptPreview
    };
    
    onSave(formattedData);
    onClose();
  };

  // Mock Receipt image upload change
  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simulate file reading and saving as simulated image URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCustomCategory = (e) => {
    e.preventDefault();
    if (newCatName.trim() !== '') {
      addCategory({
        name: newCatName.trim(),
        type: selectedType,
        icon: 'FaEllipsisH',
        color: newCatColor
      });
      setValue('category', newCatName.trim());
      setNewCatName('');
      setShowAddCat(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Blur Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" />

      {/* Modal Dialog Body */}
      <div className="glass-modal w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh] no-scrollbar z-10 animate-in zoom-in-95 duration-200">
        {/* Header Title */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60 mb-5">
          <h3 className="text-lg font-black tracking-tight bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
            {transaction ? 'Edit Transaction Details' : 'Add New Transaction'}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Entry Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-semibold">
          {/* Income vs Expense Selection Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
            <button
              type="button"
              onClick={() => setValue('type', 'expense')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${selectedType === 'expense' ? 'bg-rose-500 text-white shadow' : 'text-slate-500 hover:bg-slate-50/20'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setValue('type', 'income')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${selectedType === 'income' ? 'bg-emerald-500 text-white shadow' : 'text-slate-500 hover:bg-slate-50/20'}`}
            >
              Income
            </button>
          </div>

          {/* Title input */}
          <div className="space-y-1">
            <label className="text-slate-400">Transaction Title *</label>
            <input
              type="text"
              placeholder="e.g. Weekly Grocery Run"
              {...register('title', { required: 'Title is required' })}
              className="w-full px-4 py-2.5 glass-input text-xs"
            />
            {errors.title && <span className="text-rose-500 text-[10px] block font-bold">{errors.title.message}</span>}
          </div>

          {/* Amount input */}
          <div className="space-y-1">
            <label className="text-slate-400">Amount *</label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              {...register('amount', { 
                required: 'Amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' }
              })}
              className="w-full px-4 py-2.5 glass-input text-xs font-bold"
            />
            {errors.amount && <span className="text-rose-500 text-[10px] block font-bold">{errors.amount.message}</span>}
          </div>

          {/* Category Input Row */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-slate-400">Category *</label>
              <button
                type="button"
                onClick={() => setShowAddCat(!showAddCat)}
                className="text-[10px] text-violet-500 hover:underline font-bold"
              >
                {showAddCat ? 'Select Category' : '+ Custom Category'}
              </button>
            </div>
            
            {showAddCat ? (
              <div className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800 rounded-xl items-center animate-in slide-in-from-top-1 duration-200">
                <input
                  type="text"
                  placeholder="New Category Name"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3 py-1.5 glass-input text-[11px]"
                />
                <input
                  type="color"
                  value={newCatColor}
                  onChange={(e) => setNewCatColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200/50 dark:border-slate-800 p-0"
                />
                <button
                  type="button"
                  onClick={handleCreateCustomCategory}
                  className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-750 text-white font-bold"
                >
                  Create
                </button>
              </div>
            ) : (
              <select
                {...register('category', { required: 'Category is required' })}
                className="w-full px-4 py-2.5 glass-input text-xs"
              >
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Row layout: Date and Payment Method */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400">Date & Time *</label>
              <input
                type="datetime-local"
                {...register('date', { required: 'Date is required' })}
                className="w-full px-4 py-2.5 glass-input text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Payment Method</label>
              <select
                {...register('paymentMethod')}
                className="w-full px-4 py-2.5 glass-input text-xs"
              >
                {PAYMENT_METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags list */}
          <div className="space-y-1">
            <label className="text-slate-400">Tags (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Essential, Food, Holiday"
              {...register('tags')}
              className="w-full px-4 py-2.5 glass-input text-xs"
            />
          </div>

          {/* Description Notes */}
          <div className="space-y-1">
            <label className="text-slate-400">Description / Transaction Notes</label>
            <textarea
              placeholder="Add short description note..."
              rows={2}
              {...register('description')}
              className="w-full px-4 py-2.5 glass-input text-xs"
            />
          </div>

          {/* Receipt Image upload */}
          <div className="space-y-1.5">
            <label className="text-slate-400">Receipt Image</label>
            <div className="flex items-center gap-3">
              <label className="flex flex-col items-center justify-center w-28 h-18 border border-dashed border-slate-350 dark:border-slate-700 hover:border-violet-500 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex flex-col items-center justify-center p-2 text-center text-slate-400 hover:text-slate-500">
                  <FaCloudUploadAlt size={16} />
                  <span className="text-[8px] mt-1 font-bold uppercase tracking-wider">Upload File</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />
              </label>

              {/* Preview image */}
              {receiptPreview && (
                <div className="relative w-28 h-18 border border-slate-200/50 dark:border-slate-800 rounded-xl overflow-hidden group">
                  <img
                    src={receiptPreview}
                    alt="Receipt Receipt"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setReceiptPreview(null)}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white hover:bg-black/75 rounded-full transition-colors"
                  >
                    <FaTimes size={8} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recurring Toggler switch */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="recurring"
              {...register('recurring')}
              className="rounded border-slate-300 dark:border-slate-700 text-violet-600 focus:ring-violet-500 w-4 h-4"
            />
            <label htmlFor="recurring" className="text-xs text-slate-600 dark:text-slate-300 font-bold select-none cursor-pointer">
              Set as recurring transaction monthly bill
            </label>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white font-bold transition-all shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/25"
            >
              {transaction ? 'Save Changes' : 'Create Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default TransactionModal;
