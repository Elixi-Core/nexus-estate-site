import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';
import PageHeader from '../components/PageHeader.jsx';
import Card from '../components/Card.jsx';

// Upload an existing contract (DOCX or PDF) into Supabase Storage + create a
// row in `contracts` marking it source='uploaded'. Requires:
//   - Storage bucket `contracts` (private)
//   - RLS policies from migration 0009 (storage + contracts INSERT)
// See README §7.

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];
const MAX_SIZE_MB = 10;

function uuid() {
  // Browser-native, no extra dep
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function ContractUpload() {
  const nav = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [sellerId, setSellerId] = useState('');
  const [buyerId, setBuyerId] = useState('');
  const [dealId, setDealId] = useState('');
  const [assignmentFee, setAssignmentFee] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [notes, setNotes] = useState('');

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  function pickFile(f) {
    setError(null);
    if (!f) return;
    if (!ACCEPTED_TYPES.includes(f.type) && !/\.(pdf|docx?|)$/i.test(f.name)) {
      setError('Only PDF or Word (.pdf / .docx / .doc) files are allowed.');
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Max ${MAX_SIZE_MB} MB.`);
      return;
    }
    setFile(f);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  }

  async function submit(e) {
    e.preventDefault();
    if (!file) { setError('Pick a file first.'); return; }
    setUploading(true);
    setError(null);
    try {
      const id = uuid();
      const safeName = file.name.replace(/[^\w.\-]+/g, '_');
      const path = `${new Date().toISOString().slice(0, 10)}/${id}-${safeName}`;

      // 1. Upload to Storage
      const { error: upErr } = await supabase.storage
        .from('contracts')
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      // 2. Insert contracts row
      const row = {
        id,
        seller_id: sellerId || null,
        buyer_id: buyerId || null,
        deal_id: dealId || null,
        assignment_fee: assignmentFee === '' ? null : Number(assignmentFee),
        close_date: closeDate || null,
        docx_filename: file.name,
        storage_path: path,
        source: 'uploaded',
        notes: notes || null,
      };
      const { error: insErr } = await supabase.from('contracts').insert(row);
      if (insErr) throw insErr;

      nav('/app/contracts', { replace: true });
    } catch (err) {
      setError(err.message || 'Upload failed.');
      setUploading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Upload contract"
        subtitle="Add an existing PDF or Word doc into Nexus."
        secondary={{ label: '← Back', to: '/app/contracts' }}
      />

      <form onSubmit={submit} className="space-y-6 max-w-2xl">
        {/* Dropzone */}
        <Card title="File">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              dragOver ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            {file ? (
              <div>
                <div className="text-sm text-text font-medium truncate">{file.name}</div>
                <div className="text-xs text-muted mt-1">
                  {(file.size / 1024).toFixed(1)} KB · {file.type || 'unknown type'}
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-xs text-muted/70 hover:text-danger mt-2 underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <div className="text-sm text-text font-medium">Drop a PDF or Word doc here</div>
                <div className="text-xs text-muted mt-1">or click to browse · max {MAX_SIZE_MB} MB</div>
              </div>
            )}
          </div>
        </Card>

        {/* Metadata */}
        <Card title="Link to existing records (optional)">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Seller ID" value={sellerId} onChange={setSellerId} placeholder="seller_..." />
            <Field label="Buyer ID" value={buyerId} onChange={setBuyerId} placeholder="buyer_..." />
            <Field label="Deal ID" value={dealId} onChange={setDealId} placeholder="deal_..." />
            <Field label="Assignment fee ($)" value={assignmentFee} onChange={setAssignmentFee} type="number" placeholder="10000" />
            <Field label="Close date" value={closeDate} onChange={setCloseDate} type="date" />
          </div>
          <label className="block mt-3">
            <span className="text-xs uppercase tracking-wider text-muted">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/60 resize-y"
              placeholder="Anything worth remembering about this contract…"
            />
          </label>
        </Card>

        {error && (
          <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!file || uploading}
            className="bg-accent text-bg font-semibold rounded-lg px-5 py-2.5 text-sm hover:bg-accent/90 disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Upload contract'}
          </button>
          <button
            type="button"
            onClick={() => nav('/app/contracts')}
            className="rounded-lg border border-border text-text px-4 py-2.5 text-sm hover:border-accent/60"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-accent/60"
      />
    </label>
  );
}
