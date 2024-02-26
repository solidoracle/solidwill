'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { useAccount, useContractWrite, usePrepareContractWrite, useContractRead, useBlockNumber } from 'wagmi';
import { SOLIDWILLL_ADDRESS, SOLIDWILL_ABI } from '@/utils/constants';

export default function Home() {
  const [ownerAddress, setOwnerAddress] = useState('');
  const [frequency, setFrequency] = useState('');
  const { address } = useAccount();
  const [wills, setWills] = useState();
  const [latestId, setLatestId] = useState<number>();

  useEffect(() => {
    if (address !== undefined) {
      setOwnerAddress(address);
    }
  }, [address]);

  useContractRead({
    address: SOLIDWILLL_ADDRESS,
    abi: SOLIDWILL_ABI,
    functionName: 'allowance',
    args: [],
    watch: true,
    onSuccess(data: any) {
      setWills(data);
    },
  });

  const { config: createWillConfig } = usePrepareContractWrite({
    address: SOLIDWILLL_ADDRESS,
    abi: SOLIDWILL_ABI,
    functionName: 'createWill',
    args: [ownerAddress, frequency],
  });

  const { write: createWill } = useContractWrite({
    ...createWillConfig,
  });

  const handleCreateWill = () => {
    if (frequency !== '') {
      createWill?.();
      setFrequency('');
    } else {
      alert('Frequency is required.');
    }
  };

  useContractRead({
    address: SOLIDWILLL_ADDRESS,
    abi: SOLIDWILL_ABI,
    functionName: 'counter',
    watch: true,
    onSuccess(data: bigint) {
      data && setLatestId(Number(data));
    },
  });

  const blockNumber = useBlockNumber({
    chainId: 11155111,
    watch: false,
  });

  return (
    <div className="mx-auto flex h-[100%] min-h-[100vh] max-w-[1200px] flex-col p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <p className="text-2xl font-bold text-text-contrast">💀SOLID-WILL💀</p>
        </div>
        <ConnectButton />
      </header>
      <main className="grow pt-10 md:pt-28">
        <div className="mx-auto mt-10 max-w-md">
          <div className="mb-5 text-center">
            <h2 className="text-2xl font-bold text-text-contrast">Create Your Will</h2>
            <p className="text-sm text-text-contrast">Ensure your digital assets are safely transferred.</p>
          </div>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Frequency (in blocks)"
              className="w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              value={frequency}
              onChange={e => setFrequency(e.target.value)}
            />
            <button
              onClick={handleCreateWill}
              className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
              Create Will
            </button>
          </div>
          {latestId && blockNumber && (
            <div className="mx-auto mt-10 max-w-4xl">
              {Array.from({ length: latestId }, (_, index) => (
                <WrappedDetailRow
                  key={`detail-row-${index}`}
                  id={index}
                  blockNumber={blockNumber.data}
                  account={address}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <footer className="flex justify-center text-xs text-text-contrast">
        <div>
          An experiment by{' '}
          <Link href="https://twitter.com/solidoracle" target="_blank" className="text-text-contrast underline">
            solidoracle
          </Link>
        </div>
      </footer>
    </div>
  );
}

interface WrappedDetailRowProps {
  id: number;
  account?: string;
  blockNumber?: bigint;
}

interface WillData {
  owner: string;
  frequency: number;
  lastConfirmationBlock: number;
  fileUrl: string;
  isActive: boolean;
}

export const WrappedDetailRow: React.FC<WrappedDetailRowProps> = ({ id, account, blockNumber }) => {
  const { data, isLoading } = useContractRead({
    address: SOLIDWILLL_ADDRESS,
    abi: SOLIDWILL_ABI,
    functionName: 'getWillDetails',
    args: [id],
    watch: true,
  });

  console.log('data', data);

  const willData = data as WillData;

  if (isLoading) return <div>Loading...</div>;

  return (
    <DashboardDetailRow
      id={id}
      owner={willData?.owner}
      cadence={willData?.frequency}
      lastHeartbeat={willData?.lastConfirmationBlock}
      blockNumber={blockNumber}
      account={account}
      fileUrl={willData?.fileUrl}
    />
  );
};

interface DashboardDetailRowProps {
  id: number;
  owner: string;
  lastHeartbeat: number;
  cadence: number;
  blockNumber?: bigint;
  account?: string;
  fileUrl: string;
}

export const DashboardDetailRow: React.FC<DashboardDetailRowProps> = ({
  id,
  owner,
  lastHeartbeat,
  cadence,
  blockNumber,
  account,
  fileUrl,
}) => {
  // Simplified content display
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Property
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Value
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          <tr>
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">ID</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{id}</td>
          </tr>
          <tr>
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">Owner</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{owner}</td>
          </tr>
          <tr>
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">Last Heartbeat</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{lastHeartbeat}</td>
          </tr>
          <tr>
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">Cadence</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{cadence}</td>
          </tr>
          <tr>
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">Block Number</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
              {blockNumber ? Number(blockNumber) : null}
            </td>
          </tr>
          <tr>
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">Account</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{account}</td>
          </tr>
        </tbody>
        <tfoot>
          <button className="mt-4 w-100% rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
            Confirm Life
          </button>
        </tfoot>
      </table>
    </div>
  );
};

interface AssumedDeadInProps {
  lastHeartbeat: number;
  cadence: number;
  blockNumber?: number;
}

export const AssumedDeadIn: React.FC<AssumedDeadInProps> = ({ lastHeartbeat, cadence, blockNumber }) => {
  // Simplified time left calculation and display
  const timeLeft = lastHeartbeat + cadence - (blockNumber ?? 0);
  return <div>Time Left: {timeLeft}</div>;
};

interface ActionAreaProps {
  switchId: number;
}

export const ActionArea: React.FC<ActionAreaProps> = ({ switchId }) => {
  // Simplified action area with a single button to send heartbeat
  return (
    <div>
      <SendHeartBeat switchId={switchId} />
    </div>
  );
};

interface SendHeartBeatProps {
  switchId: number;
}

export const SendHeartBeat: React.FC<SendHeartBeatProps> = ({ switchId }) => {
  // Simplified send heartbeat functionality
  const sendHeartBeat = () => {
    console.log(`Sending heartbeat for switch ID: ${switchId}`);
    // Implement the actual send heartbeat logic here
  };

  return <button onClick={sendHeartBeat}>Send Heartbeat</button>;
};
