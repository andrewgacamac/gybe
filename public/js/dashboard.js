import { supabase, checkAuth, logout } from './auth.js?v=105';
import { setupReset } from './reset.js?v=206';

console.log('DASHBOARD MODULE START (v101)');

const PER_PAGE = 10;
let currentPage = 1;

// --- CRITICAL CHANGE: Default to 'ALL' ---
let currentStatus = 'ALL';
// ----------------------------------------

// DOM Elements
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Dashboard: DOMContentLoaded. Checking Auth...');

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    try {
        await checkAuth();
    } catch (e) {
        console.error('Auth check error:', e);
    }

    console.log('Dashboard: Auth confirmed (or bypassed).');

    setupReset();

    // Initialize UI
    const statusSelect = document.getElementById('status-filter');
    const refreshBtn = document.getElementById('refresh-btn');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    if (statusSelect) {
        statusSelect.value = currentStatus;
        statusSelect.addEventListener('change', (e) => {
            currentStatus = e.target.value;
            currentPage = 1;
            loadLeads();
        });
    }

    if (refreshBtn) refreshBtn.addEventListener('click', loadLeads);

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadLeads();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentPage++;
            loadLeads();
        });
    }

    loadLeads();
});

async function loadLeads() {
    const tbody = document.getElementById('leads-body');
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');

    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading...</td></tr>';

    try {
        console.log('Fetching leads with status:', currentStatus);

        let query = supabase
            .from('leads')
            .select(`
                *,
                photos (count)
            `, { count: 'exact' });

        if (currentStatus !== 'ALL') {
            query = query.eq('status', currentStatus);
        }

        const start = (currentPage - 1) * PER_PAGE;
        const end = start + PER_PAGE - 1;

        const { data: leads, count, error } = await query
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) {
            console.error('Supabase Query Error:', error);
            throw error;
        }

        // --- DEBUG ALERT: VISIBLE FEEDBACK FOR USER ---
        if (leads.length <= 1 && count > 1) {
            console.warn('Wait... DB says ' + count + ' items, but array has ' + leads.length);
            // alert(`DEBUG: Fetched ${leads.length} leads. Total in DB: ${count}. Check Console.`);
        }
        // ----------------------------------------------

        console.log('Leads fetched:', leads?.length, 'Total:', count);

        if (tbody) {
            tbody.innerHTML = '';
            if (!leads || leads.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No leads found. (Status: ${currentStatus})</td></tr>`;
            } else {
                leads.forEach(lead => {
                    const tr = document.createElement('tr');
                    const createdDate = new Date(lead.created_at).toLocaleDateString();
                    const createdTime = new Date(lead.created_at).toLocaleTimeString();
                    const updatedDate = new Date(lead.updated_at).toLocaleDateString();

                    let photoCount = 0;
                    // Robust handling of photos relation
                    if (Array.isArray(lead.photos)) {
                        if (lead.photos.length > 0 && lead.photos[0].count !== undefined) {
                            photoCount = lead.photos[0].count;
                        } else {
                            photoCount = lead.photos.length;
                        }
                    } else if (lead.photos && typeof lead.photos === 'object') {
                        // Fix for singular object return if cardinality is weird
                        if (lead.photos.count !== undefined) photoCount = lead.photos.count;
                    }

                    const statusClass = (lead.status || 'new').toLowerCase().replace('_', '-');

                    tr.innerHTML = `
                        <td>${createdDate} <small style="color:#666">${createdTime}</small></td>
                        <td>
                            <div style="font-weight: 500;">${lead.first_name || ''} ${lead.last_name || ''}</div>
                            <div style="font-size: 12px; color: var(--text-muted);">${lead.email || ''}</div>
                        </td>
                        <td>${photoCount}</td>
                        <td><span class="badge badge-${statusClass}" onclick="document.getElementById('status-filter').value='${lead.status}'; document.getElementById('status-filter').dispatchEvent(new Event('change'));" style="cursor: pointer;" title="Filter by this status">${lead.status || 'NEW'}</span></td>
                        <td>${updatedDate}</td>
                        <td>
                            <!-- DEBUG: Showing ID in button -->
                            <a href="lead.html?id=${lead.id}" class="btn btn-primary">View</a>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        }

        if (pageInfo) pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(count / PER_PAGE) || 1}`;
        if (prevBtn) prevBtn.disabled = currentPage === 1;
        if (nextBtn) nextBtn.disabled = currentPage >= Math.ceil(count / PER_PAGE);

    } catch (error) {
        console.error('Error loading leads:', error);
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Error loading leads: ${error.message}<br>Please check console for details.</td></tr>`;
    }
}
