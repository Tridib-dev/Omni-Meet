// app/api/webhooks/clerk/route.ts
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest, NextResponse } from 'next/server'
import { createUser, updateUser, deleteUser } from '@/lib/actions/user.actions'

export async function POST(req: NextRequest) {
    console.log('🔔 Webhook hit!')
    try {
        const evt = await verifyWebhook(req)
        const eventType = evt.type
        console.log(`[Webhook] received: ${eventType}`)

        // ── user.created ────────────────────────────────────────────────────
        if (evt.type === 'user.created') {
            const { id, email_addresses, image_url, first_name, last_name, username } = evt.data

            const email = email_addresses?.[0]?.email_address

            // Test payloads from Clerk Dashboard have no email — skip silently
            if (!email) {
                console.warn('[Webhook] user.created skipped — no email in payload (likely a test event)')
                return NextResponse.json({ message: 'Skipped: no email' }, { status: 200 })
            }

            await createUser({
                clerkId:   id,
                email,
                username:  username ?? email.split('@')[0],
                firstName: first_name ?? '',
                lastName:  last_name  ?? '',
                photo:     image_url  ?? '',
            })

            console.log(`[Webhook] user saved to DB: ${id}`)
            return NextResponse.json({ message: 'User created' }, { status: 201 })
        }

        // ── user.updated ────────────────────────────────────────────────────
        if (evt.type === 'user.updated') {
            const { id, image_url, first_name, last_name, username } = evt.data

            await updateUser(id, {
                firstName: first_name ?? '',
                lastName:  last_name  ?? '',
                username:  username   ?? '',
                photo:     image_url  ?? '',
            })

            console.log(`[Webhook] user updated in DB: ${id}`)
            return NextResponse.json({ message: 'User updated' }, { status: 200 })
        }

        // ── user.deleted ─────────────────────────────────────────────────────
        if (evt.type === 'user.deleted') {
            const { id } = evt.data
            if (id) {
                await deleteUser(id)
                console.log(`[Webhook] user deleted from DB: ${id}`)
            }
            return NextResponse.json({ message: 'User deleted' }, { status: 200 })
        }

        return NextResponse.json({ message: 'Event received' }, { status: 200 })

    } catch (err) {
        console.error('[Webhook] verification failed:', err)
        return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 })
    }
}