import Link from "next/link";

interface IInquiryOption{
    title: string;
    icon: React.ElementType;
    description: string;
    bgColor: string;
    hoverColor: string;
    iconColor: string;
    link: string;
    href: string;

}
export default function BodyMenu({InquiryOption}:{InquiryOption:IInquiryOption[]}){
  
  
        return(
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {   InquiryOption.map((option, index) => (
          <Link
            key={index}
            href={``}
            className="group relative h-64 rounded-2xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-105"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${option.bgColor} ${option.hoverColor} transition-colors duration-300`} />
            <div className="relative h-full flex flex-col items-center justify-center p-6 text-center">
              <option.icon className={`w-16 h-16 ${option.iconColor} mb-4 transition-transform duration-300 group-hover:scale-110`} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {option.title}
              </h3>
              <p className="text-sm text-gray-600">
                {option.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    )
}
