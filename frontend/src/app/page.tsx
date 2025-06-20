import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">高效管理您的任务</span>
          <span className="block text-blue-600">简单而强大</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-gray-500 sm:max-w-xl">
          跟踪您的日常任务，整理分类，永不错过截止日期。用我们的待办事项应用让您的生活更有条理。
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/auth/register"
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
          >
            立即开始
          </Link>
          <Link 
            href="/auth/login"
            className="rounded-full border border-solid border-gray-300 transition-colors flex items-center justify-center hover:bg-gray-100 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
          >
            登录
          </Link>
        </div>
      </div>
    </div>
  );
}
