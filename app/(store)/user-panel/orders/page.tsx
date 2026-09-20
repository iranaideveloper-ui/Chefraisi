"use client";

import Orders from '@/components/userPanel/Orders';
import { useRouter } from 'next/navigation';

export default function Page() {
	const router = useRouter();
	const setActiveTab = (tab: string) => {
		if (tab === 'cart') router.push('/user-panel/cart');
	};

	return <Orders setActiveTab={setActiveTab} />;
}
