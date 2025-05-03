interface ButtonProps{
    children: React.ReactNode;
    handleClick: () => void;
}

export default function Button({children,handleClick,...props}: ButtonProps) {
  return (
    <button onClick={handleClick} className="border rounded-md px-4 py-2 font-semibold text-lg" {...props}>{children}</button>
  )
}
