import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

export const alt = 'Product Details';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
    // Use direct Supabase REST API or client for Edge Runtime
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: product } = await supabase
        .from('products')
        .select('name, price, currency, media')
        .eq('slug', params.slug)
        .single();

    const productName = product?.name || 'We Naturals Product';
    const price = product?.price || '';
    const currency = product?.currency === 'INR' ? '₹' : '$';
    const displayPrice = price ? `${currency}${price}` : '';
    const image = product?.media?.[0];

    return new ImageResponse(
        (
            <div
                style={{
                    background: '#09090b', // Zinc 950
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: 'sans-serif',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Background Gradient */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-20%',
                    width: '140%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(0,0,0,0) 70%)',
                    zIndex: 0
                }} />

                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '80px',
                    width: '60%',
                    height: '100%',
                    zIndex: 10
                }}>
                    <div style={{
                        fontSize: 24,
                        letterSpacing: '4px',
                        textTransform: 'uppercase',
                        color: '#60a5fa', // Blue 400
                        marginBottom: 20
                    }}>We Naturals</div>

                    <div style={{
                        fontSize: 72,
                        fontWeight: 900,
                        lineHeight: 1.1,
                        marginBottom: 40,
                        background: 'linear-gradient(to bottom right, #ffffff, #a1a1aa)',
                        backgroundClip: 'text',
                        color: 'transparent'
                    }}>
                        {productName}
                    </div>

                    {displayPrice && (
                        <div style={{
                            fontSize: 48,
                            fontWeight: 'bold',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            {displayPrice}
                        </div>
                    )}
                </div>

                {/* Product Image Side */}
                <div style={{
                    width: '40%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#18181b', // Zinc 900
                    zIndex: 10,
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={image}
                            alt={productName}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: 0.8
                            }}
                        />
                    ) : (
                        <div style={{ fontSize: 30, color: '#52525b' }}>No Image</div>
                    )}

                    {/* Overlay */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to right, #09090b, transparent)',
                    }} />
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
