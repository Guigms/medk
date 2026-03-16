import { services } from '@/lib/mockData';
import { formatWhatsAppLink } from '@/lib/utils';

export const metadata = {
  title: 'Serviços - Farmácia Medk',
  description: 'Conheça todos os serviços oferecidos pela Farmácia Medk: aferição de pressão, aplicação de injetáveis, entrega em domicílio e mais.',
};

export default function ServicosPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Nossos Serviços
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Além de uma ampla variedade de produtos, oferecemos serviços especializados para cuidar da sua saúde
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              data-testid={`service-detail-${service.id}`}
            >
              <div className="flex items-start gap-6">
                <div className="text-6xl">{service.icon}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{service.title}</h3>
                  <p className="text-gray-600 text-lg mb-4">{service.description}</p>
                  <a
                    href={formatWhatsAppLink(`Gostaria de saber mais sobre: ${service.title}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    💬 Saiba Mais
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="bg-gradient-to-br from-green-600 to-green-500 text-white rounded-xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Precisa de algum serviço especializado?
            </h2>
            <p className="text-xl mb-6">
              Entre em contato conosco e nossa equipe estará pronta para atendê-lo com qualidade e atenção
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={formatWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-green-50 transition-colors"
                data-testid="services-whatsapp-button"
              >
                💬 WhatsApp
              </a>
              <a
                href="tel:+5585213967 83"
                className="bg-green-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-800 transition-colors border-2 border-white"
              >
                📞 Ligar Agora
              </a>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="text-center p-6">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-bold text-xl mb-2 text-gray-900">Profissionais Qualificados</h3>
            <p className="text-gray-600">Nossa equipe é treinada e certificada para oferecer o melhor atendimento</p>
          </div>
          <div className="text-center p-6">
            <div className="text-5xl mb-4">🕒</div>
            <h3 className="font-bold text-xl mb-2 text-gray-900">Horário Flexível</h3>
            <p className="text-gray-600">Estamos disponíveis em horários convenientes para você</p>
          </div>
          <div className="text-center p-6">
            <div className="text-5xl mb-4">💚</div>
            <h3 className="font-bold text-xl mb-2 text-gray-900">Atendimento Humanizado</h3>
            <p className="text-gray-600">Cuidamos de você com atenção, respeito e carinho</p>
          </div>
        </div>
      </div>
    </div>
  );
}