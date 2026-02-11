import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { createClient } from "@/lib/supabase";

const HeroBlock = ({ content }: { content: any }) => (
    <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        {content.image && (
            <>
                <Image
                    src={content.image}
                    alt={content.heading || "Hero Background"}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
            </>
        )}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-6xl font-bold mb-6"
            >
                {content.heading}
            </motion.h2>
            {content.subheading && (
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-lg md:text-xl text-zinc-200"
                >
                    {content.subheading}
                </motion.p>
            )}
        </div>
    </div>
);

const RichTextBlock = ({ content }: { content: any }) => (
    <div className="max-w-4xl mx-auto px-6">
        <div
            className="prose prose-invert prose-lg max-w-none text-zinc-300"
            dangerouslySetInnerHTML={{ __html: content.html }}
        />
    </div>
);

const ImageTextBlock = ({ content }: { content: any }) => (
    <div className="max-w-7xl mx-auto px-6">
        <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 gap-12 items-center",
            content.direction === "left" ? "" : "md:grid-flow-dense" // If right, swap order naturally or use specific classes
        )}>
            {/* Text Side */}
            <motion.div
                initial={{ opacity: 0, x: content.direction === "left" ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={cn("space-y-6", content.direction === "left" ? "md:order-2" : "md:order-1")}
            >
                {content.heading && <h2 className="text-3xl font-bold">{content.heading}</h2>}
                {content.text && <p className="text-zinc-400 text-lg leading-relaxed">{content.text}</p>}
            </motion.div>

            {/* Image Side */}
            <motion.div
                initial={{ opacity: 0, x: content.direction === "left" ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={cn("relative aspect-[4/3] rounded-2xl overflow-hidden", content.direction === "left" ? "md:order-1" : "md:order-2")}
            >
                {content.image && (
                    <Image
                        src={content.image}
                        alt={content.heading || "Section Image"}
                        fill
                        className="object-cover"
                    />
                )}
            </motion.div>
        </div>
    </div>
);

const BundleBlock = ({ content }: { content: any }) => {
    const [product, setProduct] = useState<any>(null);
    const { addItem, toggleCart } = useCart();
    const supabase = createClient();

    useEffect(() => {
        if (content.productId) {
            const fetchProduct = async () => {
                const { data } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', content.productId)
                    .single();
                if (data) setProduct(data);
            };
            fetchProduct();
        }
    }, [content.productId]);

    if (!product) return null;

    return (
        <div className="max-w-7xl mx-auto px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl"
            >
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -ml-48 -mb-48" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">
                    {/* Media Side */}
                    <div className="relative aspect-square lg:aspect-auto min-h-[400px]">
                        <Image
                            src={product.media?.[0] || product.image || "/placeholder.jpg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/40" />
                    </div>

                    {/* Content Side */}
                    <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center space-y-8">
                        <div>
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-6 inline-block">
                                Featured Ritual
                            </span>
                            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight uppercase">{product.name}</h2>
                            <p className="text-zinc-400 text-lg leading-relaxed line-clamp-3" dangerouslySetInnerHTML={{ __html: product.description }} />
                        </div>

                        {product.bundle_items && product.bundle_items.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Ritual Components</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {product.bundle_items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <Package className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-bold uppercase tracking-wider truncate">{item.name}</p>
                                                <p className="text-[9px] text-zinc-500 font-mono">x{item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-8 pt-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Ritual Value</p>
                                <p className="text-3xl font-mono font-bold text-white">${product.price}</p>
                            </div>
                            <button
                                onClick={() => {
                                    addItem(product);
                                    toggleCart();
                                }}
                                className="flex-1 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-zinc-200 transition-all shadow-2xl shadow-white/5 active:scale-[0.98]"
                            >
                                Begin Ritual
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export function BlockRenderer({ blocks }: { blocks: any[] }) {
    if (!blocks || blocks.length === 0) return null;

    return (
        <div className="space-y-24 py-24">
            {blocks.map((block) => {
                switch (block.type) {
                    case 'hero': return <HeroBlock key={block.id} content={block.content} />;
                    case 'rich_text': return <RichTextBlock key={block.id} content={block.content} />;
                    case 'image_text': return <ImageTextBlock key={block.id} content={block.content} />;
                    case 'bundle_showcase': return <BundleBlock key={block.id} content={block.content} />;
                    default: return null;
                }
            })}
        </div>
    );
}
