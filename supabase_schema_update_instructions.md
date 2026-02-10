# Supabase & Intake Process Update Instructions

## Objective
This document details the necessary steps to upgrade the YardGuard Supabase database and frontend integration. Currently, the "Get a Quote" form collects extensive project details from the user, but **only** sends contact information to Supabase.

We need to capture **all** user inputs to enable better lead qualification and providing the "AI Visualization" promise.

## 1. Data Mapping & Schema Requirements

The following table maps the HTML form inputs to the required Supabase database columns.

| Form Field Label | HTML Attribute `name` | Data Type | Required Column Name | Supabase Type | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Package Interest** | `package` | String (Enum) | `package_interest` | `text` | e.g., 'pet-yard', 'golfers-green' |
| **Project Type** | `project_type` | Array of Strings | `project_type` | `text[]` | **Critical:** Checkboxes allow multiple selections. |
| **Approximate Size** | `size` | String (Range) | `approximate_size` | `text` | e.g., '300-500' |
| **Timeline** | `timeline` | String (Enum) | `timeline` | `text` | e.g., 'asap', '1-3-months' |
| **Referral Source** | `howHeard` | String (Enum) | `referral_source` | `text` | e.g., 'google', 'neighbor' |
| **Message** | `message` | String (Long) | `message_content` | `text` | User notes/questions |
| **Street Address** | `address` | String | `street_address` | `text` | Separating from full address for better geo-logic |
| **City** | `city` | String | `city` | `text` | Default: Mississauga |
| **Postal Code** | `postalCode` | String | `postal_code` | `text` | Validation helpful later |

---

## 2. Supabase SQL Script (Database Update)

**Instruction for Admin/Database Manager:**
Run the following SQL script in the Supabase SQL Editor to update the `leads` table schema. This adds the missing columns to store the data listed above.

```sql
-- Add new columns to the 'leads' table to capture full quote details
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS package_interest text,
ADD COLUMN IF NOT EXISTS project_type text[], -- Stores multiple values like ['backyard', 'patio']
ADD COLUMN IF NOT EXISTS approximate_size text,
ADD COLUMN IF NOT EXISTS timeline text,
ADD COLUMN IF NOT EXISTS referral_source text,
ADD COLUMN IF NOT EXISTS message_content text,
ADD COLUMN IF NOT EXISTS street_address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS postal_code text;

-- Optional: Comment on columns for clarity
COMMENT ON COLUMN leads.package_interest IS 'The specific turf package the user selected (e.g., pet-yard)';
COMMENT ON COLUMN leads.project_type IS 'Array of areas the user wants to transform';
COMMENT ON COLUMN leads.approximate_size IS 'User-estimated square footage range';
```

---

## 3. Frontend Logic Update (`src/js/quote-logic.js`)

**Instruction for Frontend Developer:**
The current JavaScript logic constructs a minimal payload. It needs to be updated to extract *all* fields from the `FormData` object.

**Specific Implementation Details:**
1.  **Checkboxes (`project_type`)**: Use `formData.getAll('project_type')` instead of `get()`. `get()` only returns the *first* checked value, whereas `getAll()` returns an array of all checked values (e.g., `['backyard', 'sideyard']`).
2.  **Address Decomposition**: Instead of concatenating the address into a single string immediately, send the components (`address`, `city`, `postalCode`) to their respective columns *and* keep the formatted string if desired for display/emails.

### Updated Code Snippet for `handleFormSubmit`

Replace the current "Prepare Data Object" section (approx lines 71-86) with this robust version:

```javascript
        // --- Supabase Integration ---

        // 1. Prepare Data Object
        
        // helper to get all checkbox values properly
        // 'project_type' is a multi-select checkbox group
        const projectTypes = formData.getAll('project_type'); 

        const leadPayload = {
            // -- Contact Info --
            first_name: formData.get('firstName'),
            last_name: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone') || null,
            
            // -- Location Info (Split for better data quality) --
            street_address: formData.get('address'),
            city: formData.get('city'),
            postal_code: formData.get('postalCode'),
            // Keep the 'address' field as a fallback/display string if existing logic depends on it
            address: [formData.get('address'), formData.get('city'), formData.get('postalCode')].filter(Boolean).join(', '),

            // -- Project Details --
            package_interest: formData.get('package'), // Radio button (single value)
            project_type: projectTypes,                // Array of strings (e.g. ["backyard", "patio"])
            approximate_size: formData.get('size'),    // Select dropdown
            timeline: formData.get('timeline'),        // Select dropdown
            
            // -- Marketing & Context --
            referral_source: formData.get('howHeard'),
            message_content: formData.get('message'),  // Textarea
            
            status: 'NEW'
        };

        console.log("Submitting Payload:", leadPayload); // Debugging aid

        // 2. Insert into DB
        const { data: leadData, error: leadError } = await supabase
            .from('leads')
            .insert([leadPayload])
            .select()
            .single();
```

## 4. Verification Steps

After applying the SQL and Code changes:

1.  **Restart Local Server**: Ensure the new JS is loaded.
2.  **Submit a Test Quote**: Fill out **every** field in the form, including selecting multiple project types (e.g., "Backyard" AND "Front Yard").
3.  **Check Supabase Dashboard**: 
    - Go to Table Editor -> `leads`.
    - Verify that the new row contains data in ALL the new columns.
    - Specifically check that `project_type` is formatted as an array (e.g., `{"backyard","frontyard"}`).
