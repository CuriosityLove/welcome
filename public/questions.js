/* Curiosity.Love onboarding: the questionnaire. Edit to add, remove or reorder questions. */

/* ============================================================
   QUESTIONNAIRE
   type: text (default) | email | url | tel | textarea | select | chips | group | upload | note
   req:  true makes a question required
   when: show only if another answer matches, e.g. { k: "po_required", v: "Yes" }
   ============================================================ */
const SECTIONS = [
 { id:"company", title:"The company", intro:"The essentials.", fields:[
   {id:"company_legal", label:"Company name", req:true},
   {id:"website", label:"Website", type:"url", ph:"https://"},
   {id:"hq", label:"Headquarters city"},
   {id:"industry", label:"Industry"},
   {id:"description", label:"What does the company do?", type:"textarea", req:true, full:true, help:"A sentence or two is plenty."},
 ]},
 { id:"people", title:"Your team", intro:"Who we work with and how to reach you.", fields:[
   {id:"contact_name", label:"Primary contact", req:true},
   {id:"contact_title", label:"Title"},
   {id:"contact_email", label:"Email", type:"email", req:true},
   {id:"contact_phone", label:"Phone", type:"tel"},
   {id:"approvers", label:"Who else is involved in decisions?", type:"textarea", full:true, help:"Names, titles and emails."},
   {id:"channels", label:"Preferred channels", type:"chips", full:true, options:["Email","Phone","WhatsApp","Text","Slack Connect","Microsoft Teams"]},
 ]},
 { id:"brand", title:"The brand", intro:"Optional. Share as much or as little as you like.", fields:[
   {id:"brand_notes", label:"Anything you would like us to know?", type:"textarea", full:true, help:"The history of the company, where the brand stands today, what you hope to change, or anything else on your mind."},
 ]},
 { id:"assets", title:"Brand assets", intro:"Logos, guidelines, fonts, photography and recent decks. Send what you have, even if it is out of date.", fields:[
   {id:"_upload", type:"upload"},
   {id:"assets_link", label:"Link to your shared folder", type:"url", ph:"Google Drive, Dropbox or WeTransfer link", full:true, help:"Set sharing to anyone with the link, or add "+STUDIO.email+"."},
   {id:"assets_notes", label:"Notes on these files", type:"textarea", full:true},
 ]},
 { id:"digital", title:"Digital presence", intro:"Your website, domain and channels.", fields:[
   {id:"domain", label:"Primary domain", ph:"example.com"},
   {id:"platform", label:"Website platform", type:"select", options:["Webflow","Shopify","WordPress","Squarespace","Wix","Custom build","Not sure"]},
   {id:"instagram", label:"Instagram", ph:"@handle"},
   {id:"linkedin", label:"LinkedIn", ph:"Company page URL"},
   {id:"other_social", label:"Other channels", full:true, ph:"TikTok, YouTube, X, Facebook, Pinterest…"},
   {id:"_secure", type:"note"},
   {id:"access", label:"Which accounts can you invite us to?", type:"chips", full:true, options:["Website","Domain and DNS","Google Analytics","Social accounts","Shared drive"]},
   {id:"admin_contact", label:"Who manages these accounts?", full:true, help:"Name and email of the person who can send invitations."},
 ]},
 { id:"goals", title:"Goals and timing", intro:"What this work should achieve, and when.", fields:[
   {id:"success", label:"What would make this engagement a success?", type:"textarea", req:true, full:true},
   {id:"dates", label:"Key dates or deadlines", type:"textarea", full:true, help:"Launches, openings, events."},
 ]},
 { id:"billing", title:"Billing", intro:"So invoices reach the right place.", fields:[
   {id:"bill_entity", label:"Entity to invoice", req:true, help:"Legal name as it should appear on invoices."},
   {id:"ap_email", label:"Email for invoices", type:"email", req:true},
   {id:"bill_address", label:"Billing address", type:"textarea", req:true, full:true},
   {id:"tax_id", label:"Tax ID", help:"EIN, VAT or TRN, if needed on invoices."},
   {id:"po_required", label:"Do invoices need a PO number?", type:"select", options:["No","Yes"]},
   {id:"po_number", label:"PO number", when:{k:"po_required",v:"Yes"}},
 ]},
 { id:"permissions", title:"Confidentiality", intro:"How we may share our work together.", fields:[
   {id:"portfolio", label:"May we feature this work in our portfolio?", type:"select", req:true, full:true, options:["Yes, after public launch","Yes, with your approval first","Only without naming you","No"]},
   {id:"confidential", label:"Anything strictly confidential?", type:"textarea", full:true},
 ]},
];
