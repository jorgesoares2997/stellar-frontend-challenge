'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './example-components';
import { Contact, UserPlus, Trash2, ShieldCheck, Wallet } from 'lucide-react';

interface AddressContact {
  address: string;
  name: string;
  addedAt: number;
}

/**
 * 🎓 MASTERCLASS: Persistence with LocalStorage
 * 
 * In Web3, we often don't want to store personal data like "Grandma's Name" 
 * on the public blockchain. Instead, we use LocalStorage.
 * 
 * Key Concepts:
 * 1. JSON.stringify/parse: LocalStorage only stores strings.
 * 2. Dependency Array: We sync the UI state with the persistent storage.
 */
export default function AddressBook() {
  const [contacts, setContacts] = useState<AddressContact[]>([]);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('stellar-address-book');
    if (saved) {
      try {
        setContacts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse address book');
      }
    }
  }, []);

  // 2. Save to LocalStorage whenever contacts change
  useEffect(() => {
    localStorage.setItem('stellar-address-book', JSON.stringify(contacts));
  }, [contacts]);

  const addContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAddress) return;

    // Check if address starts with 'G' (Stellar convention)
    if (!newAddress.startsWith('G')) {
      alert('Please enter a valid Stellar Public Key (starts with G)');
      return;
    }

    const newContact: AddressContact = {
      address: newAddress,
      name: newName,
      addedAt: Date.now()
    };

    setContacts([...contacts, newContact]);
    setNewName('');
    setNewAddress('');
  };

  const removeContact = (address: string) => {
    setContacts(contacts.filter(c => c.address !== address));
  };

  return (
    <Card>
      <div className="flex flex-col space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Contact size={20} />
          </div>
          <h2 className="text-xl font-bold">Address Book</h2>
        </div>

        {/* Add Contact Form */}
        <form onSubmit={addContact} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Name (e.g. Satoshi)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-black/40 border border-primary/20 rounded-xl px-4 py-2 text-primary placeholder-primary/30 text-sm focus:border-primary focus:shadow-[0_0_15px_-3px_hsl(var(--primary)/0.5)] outline-none transition-all font-mono"
            />
            <input
              type="text"
              placeholder="Address (G...)"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="bg-black/40 border border-primary/20 rounded-xl px-4 py-2 text-primary placeholder-primary/30 text-sm focus:border-primary focus:shadow-[0_0_15px_-3px_hsl(var(--primary)/0.5)] outline-none transition-all font-mono"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/50 hover:border-primary glow-primary rounded-xl text-sm font-bold font-mono uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
          >
            <UserPlus size={16} /> Save Contact
          </button>
        </form>

        {/* Contacts List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {contacts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground opacity-50">
              <p className="text-sm">No contacts saved yet.</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <div 
                key={contact.address}
                className="flex items-center justify-between p-3 rounded-xl bg-black/40 backdrop-blur-md border border-primary/20 group hover:border-primary hover:glow-primary transition-all"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Wallet size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-bold text-sm truncate">{contact.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono truncate">{contact.address}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeContact(contact.address)}
                  className="p-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-primary/20 flex items-center gap-2 text-[10px] text-primary/50 font-mono tracking-widest uppercase">
          <ShieldCheck size={12} className="text-green-500" />
          <span>Local storage only. Your contacts never leave your browser.</span>
        </div>
      </div>
    </Card>
  );
}
