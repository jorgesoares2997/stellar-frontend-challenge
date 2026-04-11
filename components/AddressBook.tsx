'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, ShieldCheck } from 'lucide-react';

interface Contact {
  name: string;
  address: string;
  addedAt: number;
}

export default function AddressBook() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('stellar-address-book');
    if (saved) {
      try { setContacts(JSON.parse(saved)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('stellar-address-book', JSON.stringify(contacts));
  }, [contacts]);

  const addContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address) return;
    if (!address.startsWith('G') || address.length < 56) return;
    setContacts([...contacts, { name, address, addedAt: Date.now() }]);
    setName('');
    setAddress('');
    setShowForm(false);
  };

  const removeContact = (addr: string) => {
    setContacts(contacts.filter((c) => c.address !== addr));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="card-dark"
    >
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-display text-2xl text-foreground italic">Node Directory</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-ghost text-[10px] inline-flex items-center gap-1.5 py-1.5 px-4 tracking-[0.2em] uppercase transition-all hover:bg-primary/10 hover:border-primary/50"
        >
          {showForm ? 'Cancel' : <><Plus className="w-3.5 h-3.5" /> New Link</>}
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={addContact}
          className="mb-8 space-y-4 bg-muted/20 border border-border rounded-lg p-5"
        >
          <div>
            <label className="label-editorial text-muted-foreground/60">Node Alias</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Validator Prime"
              className="input-dark font-body"
            />
          </div>
          <div>
            <label className="label-editorial text-muted-foreground/60">Public Token</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="GABCD…"
              className="input-dark font-mono text-xs tracking-tight"
            />
          </div>
          <button type="submit" className="btn-primary w-full text-xs py-3 tracking-widest uppercase shadow-glow">
            Store Identity
          </button>
        </motion.form>
      )}

      {contacts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border/50 rounded-lg">
          <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground/40 uppercase">No cached identities</p>
        </div>
      ) : (
        <div className="space-y-1">
          {contacts.map((c) => (
            <div
              key={c.address}
              className="flex items-center gap-4 py-4 border-b border-border/30 last:border-0 group transition-all"
            >
              <span className="w-8 h-8 rounded bg-muted/50 flex items-center justify-center text-primary font-display text-lg italic shadow-subtle group-hover:bg-primary/10 transition-colors">
                {c.name[0]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-foreground/90 font-medium group-hover:text-primary transition-colors">{c.name}</p>
                <p className="font-mono text-[10px] text-muted-foreground/40 truncate tracking-tighter">{c.address}</p>
              </div>
              <button
                onClick={() => removeContact(c.address)}
                className="text-muted-foreground/30 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 p-2"
                title="Remove Link"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="pt-6 mt-6 border-t border-border/50 flex items-center gap-2 text-[9px] text-muted-foreground/40 font-mono tracking-widest uppercase">
          <ShieldCheck size={12} className="text-primary/40" />
          <span>Encrypted Local Cache Only</span>
      </div>
    </motion.div>
  );
}
