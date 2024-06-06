import { useEffect, useState, useRef, FormEvent } from 'react';
import { FiTrash } from 'react-icons/fi';
import { api } from './services/api';

interface CustomerProps {
  id: string;
  name: string;
  email: string;
  computador: string;
  status: boolean;
  created_at: string;
}

export default function App() {
  const [customers, setCustomers] = useState<CustomerProps[]>([]);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const computadorRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    const response = await api.get('/customers');
    setCustomers(response.data);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!nameRef.current?.value || !emailRef.current?.value || !computadorRef.current?.value) return;

    const response = await api.post('/customer', {
      name: nameRef.current?.value,
      email: emailRef.current?.value,
      computador: computadorRef.current?.value,
    });

    setCustomers(allCustomers => [...allCustomers, response.data]);

    nameRef.current.value = '';
    emailRef.current.value = '';
    computadorRef.current.value = '';
  }

  async function handleDelete(id: string) {
    try {
      await api.delete('/customer', {
        params: {
          id: id,
        },
      });

      const allCustomers = customers.filter((customer) => customer.id !== id);
      setCustomers(allCustomers);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 flex justify-center px-4">
      <main className="my-10 w-full md:max-w-2xl">
        <h1 className="text-4xl font-medium text-white flex justify-center">Controle de Maquinas PlayTime</h1>

        <form className="flex flex-col my-6" onSubmit={handleSubmit}>
          <label className="font-medium text-white">Nome:</label>
          <input
            type="text"
            placeholder="Digite seu nome completo..."
            className="w-full mb-5 p-2 rounded"
            ref={nameRef}
          />

          <label className="font-medium text-white">Email:</label>
          <input
            type="email"
            placeholder="Digite seu email..."
            className="w-full mb-5 p-2 rounded"
            ref={emailRef}
          />

          <label className="font-medium text-white">Computador:</label>
          <input
            type="text"
            placeholder="Digite o computador a ser usado..."
            className="w-full mb-5 p-2 rounded"
            ref={computadorRef}
          />

          <input
            type="submit"
            value="Cadastrar"
            className="cursor-pointer w-full p-2 bg-green-500 rounded font-medium"
          />
        </form>

        <section className="flex flex-col gap-4">
          {customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onDelete={handleDelete}
            />
          ))}
        </section>
      </main>
    </div>
  );
}

interface CustomerCardProps {
  customer: CustomerProps;
  onDelete: (id: string) => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onDelete }) => {
  const [time, setTime] = useState(3600); // 1 hour in seconds
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (time <= 0 && intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [time]);

  const startTimer = () => {
    setTime(3600);
    setIsRunning(true);
  };

  const resetTimer = () => {
    setTime(3600);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const formatTime = (time: number) => {
    const hours = String(Math.floor(time / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
    const seconds = String(time % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <article className="w-full bg-white rounded p-2 relative hover:scale-105 duration-200">
      <p><span className="font-medium">Nome:</span> {customer.name} </p>
      <p><span className="font-medium">Email:</span> {customer.email} </p>
      <p><span className="font-medium">Computador:</span> {customer.computador} </p>
      <p><span className="font-medium">Status:</span> {customer.status ? "Ativo" : "Inativo"} </p>

      <div className="mt-4">
        <p><span className="font-medium">Tempo Restante:</span> {formatTime(time)}</p>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          onClick={startTimer}
        >
          Iniciar/Reiniciar Timer
        </button>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={resetTimer}
        >
          Parar Timer
        </button>
      </div>

      <button
        className="bg-red-500 w-7 h-7 flex items-center justify-center rounded-lg absolute -right-2 -top-2"
        onClick={() => onDelete(customer.id)}
      >
        <FiTrash size={18} color="#FFF" />
      </button>
    </article>
  );
};
