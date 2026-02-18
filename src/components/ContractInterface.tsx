import React, { useState } from 'react';
import { useStacksContract, ContractNote } from '../hooks/useStacksContract';
import { useStacksWallet } from '../hooks/useStacksWallet';

export function ContractInterface() {
  const { address, isConnected, connectWallet } = useStacksWallet();
  const {
    notes,
    isLoading,
    error,
    contractInfo,
    addContractNote,
    updateContractNote,
    deleteContractNote,
    clearError,
    canInteract,
    hasNotes,
    userNotes,
  } = useStacksContract();

  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState('');

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    await addContractNote(newNote.trim());
    setNewNote('');
  };

  const handleUpdateNote = async (txid: string) => {
    if (!editNoteText.trim()) return;
    
    await updateContractNote(txid, editNoteText.trim());
    setEditingNote(null);
    setEditNoteText('');
  };

  const handleDeleteNote = async (txid: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteContractNote(txid);
    }
  };

  const startEditing = (note: ContractNote) => {
    setEditingNote(note.txid);
    setEditNoteText(note.note);
  };

  const cancelEditing = () => {
    setEditingNote(null);
    setEditNoteText('');
  };

  if (!isConnected) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Wallet to Use Contract</h3>
          <p className="text-gray-600">Connect your wallet to interact with the StackScope notes contract</p>
        </div>
        <button
          onClick={connectWallet}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contract Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Contract Address:</span>
            <span className="font-mono text-xs">{contractInfo.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Contract Name:</span>
            <span>{contractInfo.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Network:</span>
            <span className="capitalize">{contractInfo.network}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Explorer:</span>
            <a
              href={contractInfo.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Contract
            </a>
          </div>
        </div>
      </div>

      {/* Add New Note */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Note</h3>
        <div className="space-y-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter your note here..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            disabled={!canInteract}
          />
          <button
            onClick={handleAddNote}
            disabled={!canInteract || !newNote.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Adding...' : 'Add Note'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-red-800 font-medium">Error</h4>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {hasNotes && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Your Notes ({userNotes.length})
          </h3>
          <div className="space-y-4">
            {userNotes.map((note) => (
              <div key={note.txid} className="border border-gray-200 rounded-lg p-4">
                {editingNote === note.txid ? (
                  <div className="space-y-3">
                    <textarea
                      value={editNoteText}
                      onChange={(e) => setEditNoteText(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      disabled={!canInteract}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateNote(note.txid)}
                        disabled={!canInteract || !editNoteText.trim()}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                      >
                        {isLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-gray-900 whitespace-pre-wrap">{note.note}</p>
                        <div className="text-xs text-gray-500 mt-2">
                          <div>TxID: {note.txid}</div>
                          <div>Created: {new Date(note.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => startEditing(note)}
                          disabled={!canInteract}
                          className="text-blue-600 hover:text-blue-800 disabled:text-gray-400 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.txid)}
                          disabled={!canInteract}
                          className="text-red-600 hover:text-red-800 disabled:text-gray-400 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {note.isLoading && (
                      <div className="text-sm text-blue-600 mt-2">
                        Processing transaction...
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Notes */}
      {!hasNotes && !isLoading && (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No notes yet. Add your first note above!</p>
        </div>
      )}
    </div>
  );
}
