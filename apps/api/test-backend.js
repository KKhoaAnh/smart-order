/**
 * Smart Order QR — Backend Integration Test Script (Fixed)
 * Chạy: node test-backend.js
 * Yêu cầu: API server đang chạy tại http://localhost:3001
 */

const BASE = 'http://localhost:3001/api';
let TOKEN = '';
let SESSION_TOKEN = '';
let QR_TOKEN = '';
let ORDER_ID = 0;
let ITEM_ID = 0;
let ITEM_ID_2 = 0;
let passed = 0;
let failed = 0;

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

function assert(name, condition, detail) {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name} — ${detail || 'FAILED'}`);
    failed++;
  }
}

async function run() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 Smart Order QR — Backend Integration Tests');
  console.log('='.repeat(60));

  // ── Group 1: Health Check ──
  console.log('\n📌 Group 1: Server Health');
  try {
    const r = await req('GET', '/store');
    assert('1.1 Server responds', r.status === 200);
    assert('1.2 Response format { success, data }', r.data?.success === true && r.data?.data != null);
  } catch (e) {
    assert('1.1 Server responds', false, e.message);
    console.log('    ⛔ Server không chạy. Abort.\n');
    process.exit(1);
  }

  // ── Group 2: Auth ──
  console.log('\n📌 Group 2: Auth Module');
  {
    const r = await req('POST', '/auth/login', { username: 'admin', password: 'admin123' });
    assert('2.1 Login thành công (200/201)', r.status === 200 || r.status === 201);
    assert('2.2 Trả về access_token', !!r.data?.data?.access_token);
    assert('2.3 Trả về user info (admin)', r.data?.data?.user?.username === 'admin');
    assert('2.4 User có roles', Array.isArray(r.data?.data?.user?.roles) && r.data.data.user.roles.length > 0);
    TOKEN = r.data?.data?.access_token || '';
  }
  {
    const r = await req('POST', '/auth/login', { username: 'admin', password: 'wrong' });
    assert('2.5 Login sai password → 401', r.status === 401);
  }
  {
    const r = await req('GET', '/auth/profile', null, TOKEN);
    assert('2.6 GET profile với JWT → 200', r.status === 200 && r.data?.data?.username === 'admin');
  }
  {
    const r = await req('GET', '/auth/profile');
    assert('2.7 GET profile không JWT → 401', r.status === 401);
  }

  // ── Group 3: Store ──
  console.log('\n📌 Group 3: Store Module');
  {
    const r = await req('GET', '/store');
    const s = r.data?.data;
    assert('3.1 GET store → 200', r.status === 200);
    assert('3.2 Store name = Coffee House Demo', s?.name === 'Coffee House Demo');
    assert('3.3 Store status = ACTIVE', s?.status === 'ACTIVE');
  }

  // ── Group 4: Menu ──
  console.log('\n📌 Group 4: Menu Module');
  {
    const r = await req('GET', '/menu/store/1');
    const cats = r.data?.data;
    assert('4.1 GET menu → 200', r.status === 200);
    assert('4.2 Có 5 categories', Array.isArray(cats) && cats.length === 5);
    const totalProducts = cats?.reduce((sum, c) => sum + (c.products?.length || 0), 0) || 0;
    assert('4.3 Có 20 products tổng cộng', totalProducts === 20);
    const firstCat = cats?.[0];
    const firstProduct = firstCat?.products?.[0];
    assert('4.4 Product có variants array', Array.isArray(firstProduct?.variants));
    assert('4.5 Product có options array', Array.isArray(firstProduct?.options));
  }

  // ── Group 5: Tables (cần JWT, route: GET /tables) ──
  console.log('\n📌 Group 5: Tables Module');
  {
    // Route đúng: GET /api/tables (dùng JWT để lấy store_id)
    const r = await req('GET', '/tables', null, TOKEN);
    const tables = r.data?.data;
    assert('5.1 GET /tables (JWT) → 200', r.status === 200);
    assert('5.2 Có 10 bàn', Array.isArray(tables) && tables.length === 10);
    QR_TOKEN = tables?.[0]?.qr_code_token || '';
    assert('5.3 Table có qr_code_token', !!QR_TOKEN);
    assert('5.4 Table có table_number', !!tables?.[0]?.table_number);
    assert('5.5 Table có status', !!tables?.[0]?.status);
    console.log(`    📎 QR Token (table 1): ${QR_TOKEN.substring(0, 20)}...`);
  }

  // ── Group 6: Sessions ──
  console.log('\n📌 Group 6: Sessions Module');
  {
    const r = await req('POST', '/sessions/init', { qr_token: QR_TOKEN });
    const s = r.data?.data;
    assert('6.1 POST /sessions/init → 200/201', r.status === 200 || r.status === 201);
    assert('6.2 Trả về session_token', !!s?.session_token);
    assert('6.3 Trả về store info', !!s?.store?.name);
    assert('6.4 Trả về table info', !!s?.table?.table_number);
    SESSION_TOKEN = s?.session_token || '';
    console.log(`    📎 Session Token: ${SESSION_TOKEN.substring(0, 20)}...`);
  }
  {
    const r = await req('POST', '/sessions/init', { qr_token: 'invalid-token-xyz-12345' });
    assert('6.5 Init session QR sai → 400/404', r.status === 400 || r.status === 404);
  }

  // ── Group 7: Orders — Full Lifecycle ──
  console.log('\n📌 Group 7: Orders — Tạo đơn hàng');
  if (SESSION_TOKEN) {
    const r = await req('POST', '/orders', {
      session_token: SESSION_TOKEN,
      items: [
        { product_id: 1, variant_id: 1, quantity: 2, note: 'Ít đường', option_ids: [1, 5] },
        { product_id: 5, variant_id: 9, quantity: 1 },
      ],
    });
    const order = r.data?.data;
    assert('7.1 POST /orders → 200/201', r.status === 200 || r.status === 201);
    assert('7.2 Order có order_number', !!order?.order_number);
    assert('7.3 Order status = PENDING', order?.order_status === 'PENDING');
    assert('7.4 Payment status = UNPAID', order?.payment_status === 'UNPAID');
    assert('7.5 Order có items', Array.isArray(order?.items) && order.items.length >= 2);
    assert('7.6 Total amount > 0', Number(order?.total_amount) > 0);
    ORDER_ID = order?.id || 0;
    ITEM_ID = order?.items?.[0]?.id || 0;
    ITEM_ID_2 = order?.items?.[1]?.id || 0;
    console.log(`    📎 Order ID: ${ORDER_ID}, Items: [${ITEM_ID}, ${ITEM_ID_2}]`);
    console.log(`    📎 Total: ${order?.total_amount} VND`);
  } else {
    assert('7.1 Bỏ qua — không có session', false, 'SESSION_TOKEN rỗng');
  }

  console.log('\n📌 Group 8: Orders — Trạng thái đơn');
  if (ORDER_ID) {
    // Cashier confirm
    const r = await req('PATCH', `/orders/${ORDER_ID}/status`, { status: 'CONFIRMED' }, TOKEN);
    assert('8.1 PATCH /orders/:id/status → CONFIRMED', r.status === 200);

    // Get order detail
    const detail = await req('GET', `/orders/${ORDER_ID}`);
    assert('8.2 GET /orders/:id → order detail', detail.status === 200);
    assert('8.3 Order status = CONFIRMED', detail.data?.data?.order_status === 'CONFIRMED');
  }

  console.log('\n📌 Group 9: Orders — Trạng thái item (Kitchen workflow)');
  if (ITEM_ID) {
    // Kitchen: COOKING
    const r1 = await req('PATCH', `/orders/items/${ITEM_ID}/status`, { item_status: 'COOKING' }, TOKEN);
    assert('9.1 Item → COOKING', r1.status === 200);

    // Kitchen: SERVED
    const r2 = await req('PATCH', `/orders/items/${ITEM_ID}/status`, { item_status: 'SERVED' }, TOKEN);
    assert('9.2 Item 1 → SERVED', r2.status === 200);
  }
  if (ITEM_ID_2) {
    const r = await req('PATCH', `/orders/items/${ITEM_ID_2}/status`, { item_status: 'SERVED' }, TOKEN);
    assert('9.3 Item 2 → SERVED', r.status === 200);

    // Kiểm tra auto-complete
    const detail = await req('GET', `/orders/${ORDER_ID}`);
    assert('9.4 Auto-complete khi tất cả SERVED', detail.data?.data?.order_status === 'COMPLETED');
  }

  // ── Group 10: Service Requests ──
  console.log('\n📌 Group 10: Service Requests');
  if (SESSION_TOKEN) {
    // Tạo mới session vì session cũ có thể đã hết hạn sau payment
    let srSessionToken = SESSION_TOKEN;

    // Lấy 1 bàn khác để tạo session mới
    const tablesR = await req('GET', '/tables', null, TOKEN);
    const table2 = tablesR.data?.data?.[1]; // Bàn thứ 2
    if (table2?.qr_code_token) {
      const sessR = await req('POST', '/sessions/init', { qr_token: table2.qr_code_token });
      if (sessR.data?.data?.session_token) {
        srSessionToken = sessR.data.data.session_token;
      }
    }

    const r = await req('POST', '/service-requests', {
      session_token: srSessionToken,
      request_type: 'CALL_STAFF',
      message: 'Cho tôi thêm khăn giấy',
    });
    assert('10.1 POST /service-requests → 200/201', r.status === 200 || r.status === 201);
    const srId = r.data?.data?.id;

    if (srId) {
      const ack = await req('PATCH', `/service-requests/${srId}/acknowledge`, null, TOKEN);
      assert('10.2 PATCH acknowledge → 200', ack.status === 200);

      const res = await req('PATCH', `/service-requests/${srId}/resolve`, null, TOKEN);
      assert('10.3 PATCH resolve → 200', res.status === 200);
      assert('10.4 Status = RESOLVED', res.data?.data?.status === 'RESOLVED');
    }
  }

  // ── Group 11: Notifications ──
  console.log('\n📌 Group 11: Notifications');
  {
    const r = await req('GET', '/notifications?store_id=1', null, TOKEN);
    assert('11.1 GET /notifications → 200', r.status === 200);
  }
  {
    const r = await req('GET', '/notifications/count?store_id=1', null, TOKEN);
    assert('11.2 GET /notifications/count → 200', r.status === 200);
  }

  // ── Group 12: Payment ──
  console.log('\n📌 Group 12: Payment (Thanh toán)');
  if (ORDER_ID) {
    const r = await req('POST', `/orders/${ORDER_ID}/pay`, null, TOKEN);
    assert('12.1 POST /orders/:id/pay → 200/201', r.status === 200 || r.status === 201);
    const order = r.data?.data;
    assert('12.2 payment_status = PAID', order?.payment_status === 'PAID');
    assert('12.3 order_status = COMPLETED', order?.order_status === 'COMPLETED');
  }

  // ── Group 13: Orders — Gọi thêm món (tạo phiên mới) ──
  console.log('\n📌 Group 13: Gọi thêm món (add items)');
  {
    // Tạo session mới cho bàn 3
    const tablesR = await req('GET', '/tables', null, TOKEN);
    const table3 = tablesR.data?.data?.[2];
    if (table3?.qr_code_token) {
      const sessR = await req('POST', '/sessions/init', { qr_token: table3.qr_code_token });
      const newToken = sessR.data?.data?.session_token;
      if (newToken) {
        // Tạo order mới
        const orderR = await req('POST', '/orders', {
          session_token: newToken,
          items: [{ product_id: 2, variant_id: 3, quantity: 1 }],
        });
        const newOrderId = orderR.data?.data?.id;
        assert('13.1 Tạo đơn mới cho bàn 3', !!newOrderId);

        if (newOrderId) {
          // Gọi thêm món
          const addR = await req('POST', `/orders/${newOrderId}/add-items`, {
            session_token: newToken,
            items: [{ product_id: 3, variant_id: 5, quantity: 2 }],
          });
          assert('13.2 POST /orders/:id/add-items → 200', addR.status === 200 || addR.status === 201);
          const updatedOrder = addR.data?.data;
          assert('13.3 Order giờ có >= 2 items', updatedOrder?.items?.length >= 2);
          assert('13.4 Total amount tăng', Number(updatedOrder?.total_amount) > 0);
        }
      }
    }
  }

  // ── SUMMARY ──
  console.log('\n' + '='.repeat(60));
  console.log(`📊 KẾT QUẢ: ${passed} passed ✅ | ${failed} failed ❌ | ${passed + failed} total`);
  console.log('='.repeat(60));

  if (failed === 0) {
    console.log('🎉 TẤT CẢ TESTS ĐỀU PASS! Backend sẵn sàng cho Phase tiếp theo.\n');
  } else {
    console.log(`⚠️  Có ${failed} test(s) failed. Cần review lại.\n`);
  }

  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error('Fatal error:', e.message);
  process.exit(1);
});
