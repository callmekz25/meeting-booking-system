export const LoginBranding = () => {
  return (
    <div className="hidden lg:flex flex-col justify-center items-center w-3/5 bg-linear-to-br from-slate-700 via-slate-800 to-slate-900 text-white p-8 xl:p-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      <div
        id="container-login-page"
        className="relative z-10 text-center w-full flex flex-col items-center"
      >
        <h1
          id="title-login-page"
          className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-3 text-center tracking-wide leading-tight drop-shadow-lg whitespace-nowrap"
        >
          Meeting Room & Equipment
        </h1>
        <h2
          id="sub-title-login-page"
          className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold text-center mt-2 opacity-95 text-blue-200 whitespace-nowrap"
        >
          Booking System
        </h2>

        <p
          id="description-login-page"
          className="text-lg xl:text-xl opacity-90 text-center mt-8 leading-relaxed text-slate-200 max-w-lg mx-auto"
        >
          A modern platform to manage meeting room scheduling and equipment resources efficiently.
        </p>
      </div>
    </div>
  );
};
