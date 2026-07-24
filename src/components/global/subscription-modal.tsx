'use client';

import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { formatPrice, postData } from '@/lib/utils';
import { Button } from '../ui/button';
import Loader from './Loader';
import { Price, ProductWirhPrice } from '@/lib/supabase/supabase.types';
import { useToast } from '../ui/use-toast';

interface SubscriptionModalProps {
  products: ProductWirhPrice[];
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number | string;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void | Promise<void>;
  prefill?: {
    email?: string;
  };
  theme?: {
    color?: string;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');

    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ products }) => {
  const { open, setOpen } = useSubscriptionModal();
  const { toast } = useToast();
  const { subscription, user } = useSupabaseUser();

  const [isLoading, setIsLoading] = useState(false);

  const onClickContinue = async (price: Price) => {
    try {
      setIsLoading(true);

      // Check if user is logged in
      if (!user) {
        toast({
          title: 'You must be logged in',
        });
        return;
      }

      // Check if user already has a subscription
      if (subscription) {
        toast({
          title: 'Already on a paid plan',
        });
        return;
      }

      // Load Razorpay Checkout script
      const isLoaded = await loadRazorpayScript();

      if (!isLoaded) {
        toast({
          title: 'Unable to load Razorpay Checkout',
          variant: 'destructive',
        });
        return;
      }

      // Create Razorpay order on the server
      const { orderId, amount, currency, keyId } = await postData({
        url: '/api/razorpay/create-order',
        data: {
          price,
        },
      });

      // Razorpay Checkout configuration
      const options: RazorpayOptions = {
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount,
        currency,
        name: 'Web Prodigies',
        description: 'Pro Plan Subscription',
        order_id: orderId,

        // Called after Razorpay reports successful payment
        handler: async (response: RazorpayResponse) => {
          try {
            toast({
              title: 'Payment received',
              description: 'Verifying your payment...',
            });

            // Verify Razorpay payment signature on the server
            // priceId is also sent so the server can associate
            // the verified payment with the selected plan.
            const verification = await postData({
              url: '/api/razorpay/verify-payment',
              data: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                priceId: price.id,
              },
            });

            if (verification.success) {
              toast({
                title: 'Payment successful!',
                description:
                  'Your payment has been verified and your Pro plan is active.',
              });

              setOpen(false);
            } else {
              toast({
                title: 'Payment verification failed',
                variant: 'destructive',
              });
            }
          } catch (error) {
            console.error('Payment verification error:', error);

            toast({
              title: 'Payment verification failed',
              description: 'Please contact support if payment was deducted.',
              variant: 'destructive',
            });
          }
        },

        prefill: {
          email: user.email || '',
        },
      };

      // Open Razorpay Checkout
      const razorpay = new window.Razorpay(options);

      razorpay.open();
    } catch (error) {
      console.error('Razorpay checkout error:', error);

      toast({
        title: 'Oops! Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {subscription?.status === 'active' ? (
        <DialogContent>Already on a paid plan!</DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to a Pro Plan</DialogTitle>
          </DialogHeader>

          <DialogDescription>
            To access Pro features you need to have a paid plan.
          </DialogDescription>

          {products.length
            ? products.map((product) => (
                <div
                  className="flex justify-between items-center"
                  key={product.id}
                >
                  {product.prices?.map((price) => (
                    <React.Fragment key={price.id}>
                      <b className="text-3xl text-foreground">
                        {formatPrice(price)}
                      </b>

                      <Button
                        onClick={() => onClickContinue(price)}
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader /> : 'Upgrade ✨'}
                      </Button>
                    </React.Fragment>
                  ))}
                </div>
              ))
            : ''}
        </DialogContent>
      )}
    </Dialog>
  );
};

export default SubscriptionModal;