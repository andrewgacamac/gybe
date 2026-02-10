
import { supabase, checkAuth } from './auth.js?v=105';

// DEBUG ALERT - Remove later
// alert('Lead Detail JS Loaded (v200)');

const urlParams = new URLSearchParams(window.location.search);
const leadId = urlParams.get('id');

// DEBUG: If ID is missing, show error instead of redirecting
if (!leadId) {
    document.body.innerHTML = '<div style="padding: 20px; color: red;"><h1>Error: No Lead ID provided</h1><p>The URL does not contain an "id" parameter.</p><p>Current URL: ' + window.location.href + '</p><a href="index.html">Back to Dashboard</a></div>';
    throw new Error('Missing Lead ID');
}

let currentLead = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Lead Detail: DOM Loaded');

    const nameEl = document.getElementById('lead-name');
    if (nameEl) nameEl.textContent = 'Authenticating...';

    await checkAuth();

    if (nameEl) nameEl.textContent = 'Loading Lead Data...';
    loadLeadDetails();

    // Event Listeners
    const saveBtn = document.getElementById('save-estimate-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveEstimate);

    const saveNotesBtn = document.getElementById('save-notes-btn');
    if (saveNotesBtn) saveNotesBtn.addEventListener('click', saveInternalNotes);

    const approveBtn = document.getElementById('approve-btn');
    if (approveBtn) approveBtn.addEventListener('click', approveLead);

    const resendBtn = document.getElementById('resend-btn');
    if (resendBtn) resendBtn.addEventListener('click', resendEmail);

    // Reject Flow
    const rejectModal = document.getElementById('reject-modal');
    const rejectBtn = document.getElementById('reject-btn');
    if (rejectBtn) rejectBtn.addEventListener('click', () => {
        rejectModal.style.display = 'flex';
    });

    const cancelReject = document.getElementById('cancel-reject');
    if (cancelReject) cancelReject.addEventListener('click', () => {
        rejectModal.style.display = 'none';
    });

    const confirmReject = document.getElementById('confirm-reject');
    if (confirmReject) confirmReject.addEventListener('click', rejectLead);

    // Image Modal
    const imgModal = document.getElementById('img-modal');
    const modalClose = document.getElementsByClassName('modal-close')[0];
    if (modalClose) modalClose.addEventListener('click', () => {
        imgModal.style.display = 'none';
    });
    if (imgModal) imgModal.addEventListener('click', (e) => {
        if (e.target === imgModal) imgModal.style.display = 'none';
    });
});

async function loadLeadDetails() {
    try {
        console.log('Fetching Lead:', leadId);
        // Fetch Lead
        const { data: lead, error } = await supabase
            .from('leads')
            .select('*')
            .eq('id', leadId)
            .single();

        if (error) throw error;
        currentLead = lead;

        // Render fields (names, etc.)
        document.getElementById('lead-name').textContent = `${lead.first_name} ${lead.last_name}`;
        document.getElementById('lead-email').textContent = lead.email;
        document.getElementById('lead-phone').textContent = lead.phone || 'N/A';

        // Address Logic
        document.getElementById('lead-address').textContent = lead.street_address || lead.address || 'N/A';
        const cityPostal = [lead.city, lead.postal_code].filter(Boolean).join(', ');
        const cityPostalEl = document.getElementById('lead-city-postal');
        if (cityPostalEl) cityPostalEl.textContent = cityPostal || 'N/A';

        document.getElementById('lead-created').textContent = new Date(lead.created_at).toLocaleString();

        const retryEl = document.getElementById('lead-retry');
        if (retryEl) {
            retryEl.textContent = lead.retry_count || 0;
        }

        // Project Specs
        const setMap = {
            'lead-package': lead.package_interest,
            'lead-size': lead.approximate_size,
            'lead-timeline': lead.timeline,
            'lead-source': lead.referral_source,
            'lead-message': lead.message_content || '(No message)'
        };

        for (const [id, val] of Object.entries(setMap)) {
            const el = document.getElementById(id);
            if (el) el.textContent = val || '-';
        }

        // Project Type Array
        const typeEl = document.getElementById('lead-type');
        if (typeEl) {
            let types = lead.project_type || [];
            if (typeof types === 'string' && types.startsWith('{')) {
                types = types.replace(/[{}]/g, '').split(',');
            }
            if (Array.isArray(types)) {
                typeEl.textContent = types.join(', ');
            } else {
                typeEl.textContent = types || '-';
            }
        }

        const estText = document.getElementById('estimate-text');
        if (estText) estText.value = lead.final_estimate || lead.ai_estimate || '';

        // Status Badge
        const statusBadge = document.getElementById('lead-status-badge');
        if (statusBadge) statusBadge.innerHTML = `<span class="badge badge-${(lead.status || 'new').toLowerCase().replace('_', '-')}">${lead.status}</span>`;

        // Rejection Reason
        if (lead.rejection_reason) {
            document.getElementById('rejection-box').style.display = 'block';
            document.getElementById('rejection-reason').textContent = lead.rejection_reason;
        }

        // Populate Internal Notes
        if (document.getElementById('internal-notes')) {
            document.getElementById('internal-notes').value = lead.internal_notes || '';
        }

        // Action Logic
        const actionsDiv = document.getElementById('actions-container');
        const approveBtn = document.getElementById('approve-btn');
        const resendBtn = document.getElementById('resend-btn');
        const rejectBtn = document.getElementById('reject-btn');
        const saveEstimateBtn = document.getElementById('save-estimate-btn');
        const estimateText = document.getElementById('estimate-text');

        if (actionsDiv && approveBtn && resendBtn) {
            if (lead.status === 'COMPLETED' || lead.status === 'APPROVED') {
                // Show Resend Button
                resendBtn.style.display = 'inline-block';
                approveBtn.style.display = 'none'; // Already approved
                actionsDiv.style.display = 'flex';
            } else if (lead.status === 'REJECTED') {
                actionsDiv.style.display = 'none';
                if (saveEstimateBtn) saveEstimateBtn.disabled = true;
                if (estimateText) estimateText.disabled = true;
            } else {
                // New / Needs Review / Processing
                approveBtn.style.display = 'inline-block';
                resendBtn.style.display = 'none';
            }
        }

        loadPhotos();

    } catch (error) {
        console.error('Error loading lead:', error);
        alert('Failed to load lead details: ' + error.message);
        document.getElementById('lead-name').textContent = 'Error Loading Lead';
    }
}

async function loadPhotos() {
    const container = document.getElementById('photos-container');
    if (!container) return;

    container.innerHTML = 'Loading photos...';

    const { data: photos, error } = await supabase
        .from('photos')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at');

    if (error) {
        container.innerHTML = 'Error loading photos: ' + error.message;
        console.error(error);
        return;
    }

    container.innerHTML = '';

    if (!photos || photos.length === 0) {
        container.innerHTML = 'No photos found.';
        return;
    }

    for (const photo of photos) {
        // Use Public URL first (since we made bucket public)
        let originalUrl = null;
        if (photo.original_path) {
            const { data } = supabase.storage.from('raw_uploads').getPublicUrl(photo.original_path);
            originalUrl = data.publicUrl;
        }

        let processedUrl = null;
        if (photo.processed_path) {
            const { data } = supabase.storage.from('processed_images').getPublicUrl(photo.processed_path);
            processedUrl = data.publicUrl;
        }

        const div = document.createElement('div');
        div.innerHTML = `
            <div style="position: relative;">
                <img src="${originalUrl || '#'}" onclick="openModal('${originalUrl}')" title="Original" style="display: ${originalUrl ? 'block' : 'none'}; width: 100%; height: 150px; object-fit: cover; cursor: pointer;" loading="lazy" alt="Lead Image">
                ${processedUrl ? `<div style="position: absolute; top: 0; right: 0; background: rgba(0,0,0,0.7); color: white; padding: 2px 6px; font-size: 10px;">PROCESSED</div>` : ''}
            </div>
            ${processedUrl ? `
                <div style="border-top: 1px solid var(--border);">
                    <img src="${processedUrl}" onclick="openModal('${processedUrl}')" title="Processed" loading="lazy" style="width: 100%; height: 150px; object-fit: cover; cursor: pointer;">
                </div>
            ` : ''}
            <div class="photo-meta">Uploaded: ${new Date(photo.created_at).toLocaleDateString()}</div>
        `;
        container.appendChild(div);
    }
}

async function resendEmail() {
    if (!confirm('Resend email to customer?')) return;

    const btn = document.getElementById('resend-btn');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
        console.log('Resending email for:', leadId);
        const { data, error } = await supabase.functions.invoke('email-sender', {
            body: { lead_id: leadId }
        });

        if (error) throw error;
        if (data && data.success === false) throw new Error(data.error);

        alert('Email sent successfully!');
    } catch (err) {
        console.error('Resend Error:', err);
        let msg = err.message;
        try {
            if (err.context && err.context.json) {
                const j = await err.context.json();
                msg = j.error || msg;
            }
        } catch (e) { }
        alert('Failed to send email: ' + msg);
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

async function saveEstimate() {
    const newEstimate = document.getElementById('estimate-text').value;
    const btn = document.getElementById('save-estimate-btn');

    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        const { error } = await supabase
            .from('leads')
            .update({ final_estimate: newEstimate })
            .eq('id', leadId);

        if (error) throw error;
        alert('Estimate saved successfully');
    } catch (error) {
        alert('Error saving estimate: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save Estimate';
    }
}

async function saveInternalNotes() {
    const notes = document.getElementById('internal-notes').value;
    const btn = document.getElementById('save-notes-btn');

    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        const { error } = await supabase
            .from('leads')
            .update({ internal_notes: notes })
            .eq('id', leadId);

        if (error) throw error;
        alert('Internal notes saved.');
    } catch (error) {
        alert('Failed to save notes: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save Notes';
    }
}

async function approveLead() {
    if (!confirm('Are you sure you want to approve this lead? This will trigger the email to the customer.')) return;

    const btn = document.getElementById('approve-btn');
    btn.disabled = true;
    btn.textContent = 'Sending Email...';

    try {
        // God Mode Fallback
        const user = { id: '77262f75-da5d-48a3-ab21-e218033071d3', email: 'admin@yardguard.com' };

        // 1. Update status to APPROVED
        const { error: dbError } = await supabase
            .from('leads')
            .update({
                status: 'APPROVED',
                approved_by: user.id
            })
            .eq('id', leadId);

        if (dbError) throw dbError;

        // 2. Trigger Email Sender Function
        console.log('Triggering email-sender for:', leadId);
        const { data: emailData, error: emailError } = await supabase.functions.invoke('email-sender', {
            body: { lead_id: leadId }
        });

        if (emailError) {
            console.error('Email Function Error:', emailError);
            alert('Lead Approved, BUT Email Failed to Send. Check logs.');
        } else {
            console.log('Email Sent:', emailData);
            alert('Success! Lead approved and email sent to customer.');
        }

        window.location.href = 'index.html';

    } catch (error) {
        console.error('Approval Error:', error);
        alert('Error approving lead: ' + error.message);
        btn.disabled = false;
        btn.textContent = 'Approve & Send Email';
    }
}

async function rejectLead() {
    const reason = document.getElementById('reject-reason-input').value;
    if (!reason) {
        alert('Please enter a rejection reason');
        return;
    }

    const btn = document.getElementById('confirm-reject');
    btn.disabled = true;
    btn.textContent = 'Rejecting...';

    try {
        const { error } = await supabase
            .from('leads')
            .update({
                status: 'REJECTED',
                rejection_reason: reason
            })
            .eq('id', leadId);

        if (error) throw error;

        window.location.href = 'index.html';

    } catch (error) {
        alert('Error rejecting lead: ' + error.message);
        btn.disabled = false;
        btn.textContent = 'Confirm Reject';
    }
}

// Global scope for onclick
window.openModal = function (src) {
    if (!src || src === 'undefined') return;
    const modal = document.getElementById('img-modal');
    const img = document.getElementById('modal-img-content');
    img.src = src;
    modal.style.display = 'flex';
}
