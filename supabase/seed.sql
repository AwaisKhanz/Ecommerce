insert into public.categories (id, slug, name, description, sort_order)
values
  ('10000000-0000-0000-0000-000000000001', 'generators', 'Generators', 'Portable and standby power solutions.', 1),
  ('10000000-0000-0000-0000-000000000002', 'water-pumps', 'Water Pumps', 'Pumps for home, farm, and industrial use.', 2),
  ('10000000-0000-0000-0000-000000000003', 'electrical', 'Electrical', 'Electrical equipment and accessories.', 3),
  ('10000000-0000-0000-0000-000000000004', 'tools', 'Tools', 'Professional-grade tools and equipment.', 4),
  ('10000000-0000-0000-0000-000000000005', 'accessories', 'Accessories', 'Parts, fittings, and maintenance essentials.', 5)
on conflict (id) do nothing;

insert into public.products (
  id, slug, sku, name, short_description, description, specifications, price, stock_quantity,
  low_stock_threshold, status, brand, tags
)
values
  ('20000000-0000-0000-0000-000000000001', 'portable-generator-1kw', 'GEN-001', 'Portable Generator 1kW', 'Compact backup generator.', 'Reliable compact generator for light-duty backup power.', '{"Power":"1kW"}', 299.00, 12, 3, 'active', 'IndustrialShop', array['featured']),
  ('20000000-0000-0000-0000-000000000002', 'portable-generator-2kw', 'GEN-002', 'Portable Generator 2kW', 'Mid-size portable generator.', 'Balanced output for tools and home essentials.', '{"Power":"2kW"}', 499.00, 10, 3, 'active', 'IndustrialShop', array['featured']),
  ('20000000-0000-0000-0000-000000000003', 'diesel-generator-5kw', 'GEN-003', 'Diesel Generator 5kW', 'Heavy-duty diesel power.', 'Built for demanding work sites and long runtime.', '{"Power":"5kW"}', 1199.00, 6, 2, 'active', 'IndustrialShop', array['featured']),
  ('20000000-0000-0000-0000-000000000004', 'standby-generator-10kw', 'GEN-004', 'Standby Generator 10kW', 'High-capacity standby unit.', 'Automatic standby generator for larger loads.', '{"Power":"10kW"}', 2499.00, 4, 2, 'active', 'IndustrialShop', array[]::text[]),
  ('20000000-0000-0000-0000-000000000005', 'surface-pump-1hp', 'PMP-001', 'Surface Pump 1HP', 'General-purpose water pump.', 'Suitable for domestic transfer and irrigation.', '{"Power":"1HP"}', 149.00, 20, 5, 'active', 'IndustrialShop', array['featured']),
  ('20000000-0000-0000-0000-000000000006', 'surface-pump-2hp', 'PMP-002', 'Surface Pump 2HP', 'Higher-flow surface pump.', 'Improved head and flow for larger systems.', '{"Power":"2HP"}', 229.00, 14, 4, 'active', 'IndustrialShop', array[]::text[]),
  ('20000000-0000-0000-0000-000000000007', 'submersible-pump-1hp', 'PMP-003', 'Submersible Pump 1HP', 'Submersible water pump.', 'Designed for wells, tanks, and continuous transfer.', '{"Power":"1HP"}', 279.00, 9, 3, 'active', 'IndustrialShop', array[]::text[]),
  ('20000000-0000-0000-0000-000000000008', 'submersible-pump-2hp', 'PMP-004', 'Submersible Pump 2HP', 'Heavy-duty submersible pump.', 'For deeper wells and higher delivery needs.', '{"Power":"2HP"}', 399.00, 7, 3, 'active', 'IndustrialShop', array[]::text[]),
  ('20000000-0000-0000-0000-000000000009', 'circuit-breaker-32a', 'ELE-001', 'Circuit Breaker 32A', 'Protective breaker.', 'Reliable circuit protection for electrical panels.', '{"Current":"32A"}', 19.00, 40, 10, 'active', 'IndustrialShop', array[]::text[]),
  ('20000000-0000-0000-0000-000000000010', 'circuit-breaker-63a', 'ELE-002', 'Circuit Breaker 63A', 'Higher-capacity breaker.', 'Industrial-grade protection for larger loads.', '{"Current":"63A"}', 29.00, 35, 10, 'active', 'IndustrialShop', array[]::text[]),
  ('20000000-0000-0000-0000-000000000011', 'voltage-stabilizer-5kva', 'ELE-003', 'Voltage Stabilizer 5kVA', 'Power conditioning unit.', 'Protects equipment from unstable voltage.', '{"Capacity":"5kVA"}', 189.00, 11, 3, 'active', 'IndustrialShop', array['featured']),
  ('20000000-0000-0000-0000-000000000012', 'extension-cable-20m', 'ELE-004', 'Extension Cable 20m', 'Heavy-duty extension cable.', 'Flexible industrial cable for site work.', '{"Length":"20m"}', 39.00, 25, 6, 'active', 'IndustrialShop', array[]::text[]),
  ('20000000-0000-0000-0000-000000000013', 'angle-grinder-900w', 'TOL-001', 'Angle Grinder 900W', 'Compact grinder.', 'For cutting, grinding, and finishing tasks.', '{"Power":"900W"}', 79.00, 18, 4, 'active', 'IndustrialShop', array[]::text[]),
  ('20000000-0000-0000-0000-000000000014', 'rotary-hammer-drill', 'TOL-002', 'Rotary Hammer Drill', 'Masonry drill.', 'Built for concrete drilling and chiseling.', '{"Mode":"Rotary hammer"}', 149.00, 13, 4, 'active', 'IndustrialShop', array['featured']),
  ('20000000-0000-0000-0000-000000000015', 'welding-machine-200a', 'TOL-003', 'Welding Machine 200A', 'Arc welding machine.', 'Portable welding output for workshop use.', '{"Current":"200A"}', 239.00, 8, 3, 'active', 'IndustrialShop', array[]::text[]),
  ('20000000-0000-0000-0000-000000000016', 'tool-kit-108pc', 'TOL-004', 'Tool Kit 108pc', 'Complete hand-tool kit.', 'A versatile kit for maintenance and repairs.', '{"Pieces":"108"}', 119.00, 16, 4, 'active', 'IndustrialShop', array[]::text[]),
  ('20000000-0000-0000-0000-000000000017', 'pump-hose-10m', 'ACC-001', 'Pump Hose 10m', 'Flexible delivery hose.', 'Durable hose compatible with common pumps.', '{"Length":"10m"}', 24.00, 30, 8, 'active', 'IndustrialShop', array[]::text[]),
  ('20000000-0000-0000-0000-000000000018', 'generator-oil-1l', 'ACC-002', 'Generator Oil 1L', 'Maintenance oil.', 'Recommended oil for generator servicing.', '{"Volume":"1L"}', 12.00, 50, 12, 'active', 'IndustrialShop', array[]::text[]),
  ('20000000-0000-0000-0000-000000000019', 'safety-gloves', 'ACC-003', 'Safety Gloves', 'Work gloves.', 'Protective gloves for workshop tasks.', '{"Size":"Universal"}', 9.00, 60, 15, 'active', 'IndustrialShop', array[]::text[]),
  ('20000000-0000-0000-0000-000000000020', 'fuel-can-20l', 'ACC-004', 'Fuel Can 20L', 'Portable fuel storage.', 'Durable canister for safe fuel transport.', '{"Capacity":"20L"}', 34.00, 22, 6, 'active', 'IndustrialShop', array[]::text[])
on conflict (id) do nothing;

insert into public.product_categories (product_id, category_id)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002'),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000003'),
  ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000004'),
  ('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000005'),
  ('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000005'),
  ('20000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000005'),
  ('20000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000005')
on conflict do nothing;

insert into public.settings (key, value)
values
  ('business_info', '{"name":"IndustrialShop","address":"","phone":"","email":"","hours":""}'::jsonb),
  ('enabled_locales', '["en"]'::jsonb),
  ('shipping_config', '{"zones":[],"fees":[]}'::jsonb),
  ('tax_config', '{"rate":0}'::jsonb),
  ('maintenance_mode', 'false'::jsonb),
  ('low_stock_threshold_default', '5'::jsonb)
on conflict (key) do nothing;

insert into public.feature_flags (key, enabled, rollout_pct)
values
  ('ONLINE_PAYMENTS', false, 0),
  ('CUSTOMER_ACCOUNTS', false, 0),
  ('REVIEWS', false, 0),
  ('WISHLIST', false, 0),
  ('COUPONS', false, 0),
  ('MULTILANG_AR', false, 0),
  ('ADMIN_AUDIT_DIFF_VIEW', true, 100),
  ('CHAT_WIDGET', false, 0),
  ('MAINTENANCE_MODE', false, 0)
on conflict (key) do nothing;
